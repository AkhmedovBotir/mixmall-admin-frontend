const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const config = require('../config/config');

const { BASE_URL, UPLOADS_PATH } = config;

// Modellarni olish
const Product = mongoose.model('Product');
const Cart = mongoose.model('Cart');

// Rasm yuklash uchun multer konfiguratsiyasi
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'public/uploads';
        // Papka mavjud bo'lmasa yaratish
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Faqat rasm fayllari qabul qilinadi!'));
    }
});

// Barcha mahsulotlarni olish
router.get('/', async (req, res) => {
    try {
        console.log('GET /products request received'); // Request kelganini tekshirish
        const { 
            search, 
            category,
            brand,
            minPrice, 
            maxPrice,
            sortBy,
            sortOrder,
            page = 1,
            limit = 12
        } = req.query;

        console.log('Query:', req.query); // Query ni tekshirish

        // Filter yaratish
        let filter = {};

        // Qidiruv
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Kategoriya bo'yicha filtrlash
        if (category) {
            filter.category = category;
        }

        // Brand bo'yicha filtrlash
        if (brand) {
            filter.brand = brand;
        }

        // Narx bo'yicha filtrlash
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        console.log('Filter:', filter); // Filter ni tekshirish

        // Saralash
        let sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort = { createdAt: -1 }; // Default saralash
        }

        console.log('Sort query:', sort); // Sort query ni tekshirish

        // Pagination
        const skip = (page - 1) * limit;

        // Mahsulotlarni olish
        const products = await Product.find(filter)
            .populate('category')
            .populate('brand')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        console.log('Found products:', products.length); // Topilgan mahsulotlar sonini tekshirish

        // Umumiy mahsulotlar sonini olish
        const total = await Product.countDocuments(filter);

        // Mahsulot ma'lumotlarini formatlash va rasm URL larini qo'shish
        const formattedProducts = products.map(product => {
            const productObj = product.toObject();
            
            // Rasmlar uchun to'liq URL yaratish
            if (productObj.images && productObj.images.length > 0) {
                productObj.images = productObj.images.map(image => 
                    `https://adderapi.mixmall.uz/uploads/${image}`
                );
            } else {
                productObj.images = [`https://adderapi.mixmall.uz/uploads/no-image.jpg`];
            }
            
            return productObj;
        });

        res.json({
            success: true,
            data: {
                products: formattedProducts,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Mahsulotlarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Mahsulot qo'shish (Admin uchun)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Faqat admin mahsulot qo\'sha oladi'
            });
        }

        const {
            name,
            description,
            price,
            discount_percent,
            quantity,
            brand,
            category,
            categories,
            subcategories,
            specifications
        } = req.body;

        // Rasmlarni saqlash
        const images = req.files ? req.files.map(file => file.filename) : [];

        const product = new Product({
            name,
            description,
            price: Number(price),
            discount_percent: Number(discount_percent || 0),
            quantity: Number(quantity || 0),
            brand,
            category,
            categories: categories ? JSON.parse(categories) : [],
            subcategories: subcategories ? JSON.parse(subcategories) : [],
            specifications: specifications ? JSON.parse(specifications) : [],
            images
        });

        await product.save();

        // Response uchun rasmlarni to'liq URL bilan qaytarish
        const productObj = product.toObject();
        if (productObj.images && productObj.images.length > 0) {
            productObj.images = productObj.images.map(image => 
                `https://adderapi.mixmall.uz/uploads/${image}`
            );
        } else {
            productObj.images = [`https://adderapi.mixmall.uz/uploads/no-image.jpg`];
        }

        res.status(201).json({
            success: true,
            message: 'Mahsulot muvaffaqiyatli qo\'shildi',
            data: productObj
        });

    } catch (error) {
        // Xatolik bo'lsa, yuklangan rasmlarni o'chirish
        if (req.files) {
            for (const file of req.files) {
                const filePath = path.join(UPLOADS_PATH, file.filename);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error('Rasmni o\'chirishda xatolik:', err);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'Mahsulot qo\'shishda xatolik yuz berdi',
            error: error.message
        });
    }
});

// Mahsulotni tahrirlash (Admin uchun)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Faqat admin mahsulotni tahrirlay oladi'
            });
        }

        const {
            name,
            description,
            price,
            discount_percent,
            quantity,
            brand,
            category,
            categories,
            subcategories,
            specifications,
            deleteImages
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // O'chirilishi kerak bo'lgan rasmlarni o'chirish
        if (deleteImages) {
            const imagesToDelete = JSON.parse(deleteImages);
            for (const image of imagesToDelete) {
                const index = product.images.indexOf(image);
                if (index > -1) {
                    product.images.splice(index, 1);
                    // Faylni o'chirish
                    const filePath = path.join(UPLOADS_PATH, image);
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (err) {
                        console.error('Rasmni o\'chirishda xatolik:', err);
                    }
                }
            }
        }

        // Yangi rasmlarni qo'shish
        if (req.files && req.files.length > 0) {
            product.images.push(...req.files.map(file => file.filename));
        }

        // Mahsulot ma'lumotlarini yangilash
        product.name = name || product.name;
        product.description = description || product.description;
        if (price) product.price = Number(price);
        if (discount_percent !== undefined) product.discount_percent = Number(discount_percent);
        if (quantity !== undefined) product.quantity = Number(quantity);
        if (brand) product.brand = brand;
        if (category) product.category = category;
        if (categories) product.categories = JSON.parse(categories);
        if (subcategories) product.subcategories = JSON.parse(subcategories);
        if (specifications) product.specifications = JSON.parse(specifications);

        await product.save();

        // Response uchun rasmlarni to'liq URL bilan qaytarish
        const productObj = product.toObject();
        if (productObj.images && productObj.images.length > 0) {
            productObj.images = productObj.images.map(image => 
                `https://adderapi.mixmall.uz/uploads/${image}`
            );
        } else {
            productObj.images = [`https://adderapi.mixmall.uz/uploads/no-image.jpg`];
        }

        res.json({
            success: true,
            message: 'Mahsulot muvaffaqiyatli yangilandi',
            data: productObj
        });

    } catch (error) {
        // Xatolik bo'lsa, yangi yuklangan rasmlarni o'chirish
        if (req.files) {
            for (const file of req.files) {
                const filePath = path.join(UPLOADS_PATH, file.filename);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error('Rasmni o\'chirishda xatolik:', err);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'Mahsulotni yangilashda xatolik yuz berdi',
            error: error.message
        });
    }
});

// Mahsulot detallari
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('brand')
            .populate({
                path: 'ratings.user',
                select: 'firstName lastName image'
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Mahsulot ma'lumotlarini formatlash
        const productObj = product.toObject();

        // Rasmlar uchun to'liq URL yaratish
        if (productObj.images && productObj.images.length > 0) {
            productObj.images = productObj.images.map(image => 
                `https://adderapi.mixmall.uz/uploads/${image}`
            );
        } else {
            productObj.images = [`https://adderapi.mixmall.uz/uploads/no-image.jpg`];
        }

        // Foydalanuvchi rasmlari uchun URL yaratish
        if (productObj.ratings && productObj.ratings.length > 0) {
            productObj.ratings = productObj.ratings.map(rating => ({
                ...rating,
                user: {
                    ...rating.user,
                    image: rating.user && rating.user.image ? 
                        `https://adderapi.mixmall.uz/uploads/${rating.user.image}` : 
                        `https://adderapi.mixmall.uz/uploads/no-image.jpg`
                }
            }));

            // O'rtacha reytingni hisoblash
            const totalRating = productObj.ratings.reduce((sum, r) => sum + r.rating, 0);
            productObj.averageRating = totalRating / productObj.ratings.length;
            productObj.totalRatings = productObj.ratings.length;
        } else {
            productObj.ratings = [];
            productObj.averageRating = 0;
            productObj.totalRatings = 0;
        }

        // O'xshash mahsulotlarni olish
        const similarProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        })
        .limit(4)
        .select('name price images discount_price discount_percent stock');

        // O'xshash mahsulotlar uchun rasmlarni to'g'rilash
        const formattedSimilarProducts = similarProducts.map(prod => {
            const similarProd = prod.toObject();
            if (similarProd.images && similarProd.images.length > 0) {
                similarProd.images = similarProd.images.map(image => 
                    `https://adderapi.mixmall.uz/uploads/${image}`
                );
            } else {
                similarProd.images = [`https://adderapi.mixmall.uz/uploads/no-image.jpg`];
            }
            return similarProd;
        });

        res.json({
            success: true,
            data: {
                ...productObj,
                similarProducts: formattedSimilarProducts
            }
        });
    } catch (error) {
        console.error('Mahsulot ma\'lumotlarini olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Mahsulot ma\'lumotlarini olishda xatolik yuz berdi'
        });
    }
});

// Mahsulotga rating qo'shish
router.post('/:id/rating', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user._id;

        // Rating qiymatini tekshirish
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating 1 dan 5 gacha bo\'lishi kerak'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Foydalanuvchi oldin rating qo'ygan-qo'ymaganini tekshirish
        const existingRatingIndex = product.ratings.findIndex(r => 
            r.user.toString() === userId.toString());
        
        if (existingRatingIndex !== -1) {
            // Mavjud ratingni yangilash
            product.ratings[existingRatingIndex] = {
                user: userId,
                rating,
                comment,
                createdAt: new Date()
            };
        } else {
            // Yangi rating qo'shish
            product.ratings.push({
                user: userId,
                rating,
                comment,
                createdAt: new Date()
            });
        }

        await product.save();

        res.json({
            success: true,
            message: 'Rating muvaffaqiyatli qo\'shildi',
            data: product
        });
    } catch (error) {
        console.error('Rating qo\'shishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Rating qo\'shishda xatolik yuz berdi'
        });
    }
});

// Savatni olish
router.get('/cart', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Savatni topish va mahsulot ma'lumotlarini to'ldirish
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name price discount_price stock images'
            });

        if (!cart) {
            return res.json({
                success: true,
                cart: { items: [] }
            });
        }

        res.json({
            success: true,
            cart
        });
    } catch (error) {
        console.error('Savatni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// Foydalanuvchi savatini olish
router.get('/user/cart', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId');

        if (!cart) {
            return res.json({
                success: true,
                data: {
                    items: [],
                    totalAmount: 0,
                    totalDiscountAmount: 0
                }
            });
        }

        res.json({
            success: true,
            data: cart
        });

    } catch (error) {
        console.error('Savatni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Savatni olishda xatolik yuz berdi'
        });
    }
});

// Mahsulotlar ro'yxatini olish
router.get('/products', async (req, res) => {
    try {
        console.log('GET /products request received'); // Request kelganini tekshirish
        const { search, category, brand, minPrice, maxPrice, sort } = req.query;
        let query = {};

        // Qidiruv
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Kategoriya bo'yicha filtrlash
        if (category) {
            query.category = category;
        }

        // Brend bo'yicha filtrlash
        if (brand) {
            query.brand = brand;
        }

        // Narx bo'yicha filtrlash
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        console.log('Query:', query); // Query ni tekshirish

        // Saralash
        let sortQuery = {};
        if (sort === 'price_asc') {
            sortQuery.price = 1;
        } else if (sort === 'price_desc') {
            sortQuery.price = -1;
        }

        console.log('Sort query:', sortQuery); // Sort query ni tekshirish

        const products = await Product.find(query)
            .sort(sortQuery)
            .populate('category')
            .populate('brand');

        console.log('Found products:', products.length); // Topilgan mahsulotlar sonini tekshirish

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Mahsulotlarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// Savatni olish
router.get('/user-cart', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Savatni topish va mahsulot ma'lumotlarini to'ldirish
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name price discount_price stock images'
            });

        if (!cart) {
            return res.json({
                success: true,
                cart: { items: [] }
            });
        }

        res.json({
            success: true,
            cart
        });
    } catch (error) {
        console.error('Savatni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// Mahsulotni savatga qo'shish
router.post('/:productId/add-to-cart', auth, async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user._id;
        const quantity = parseInt(req.body.quantity) || 1;

        // Mahsulotni tekshirish
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Ombordagi miqdorni tekshirish
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Kechirasiz, omborda yetarli mahsulot mavjud emas'
            });
        }

        // Savatni topish yoki yaratish
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Mahsulot savatda borligini tekshirish
        const existingItem = cart.items.find(item => 
            item.product && item.product.toString() === productId.toString()
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Bu mahsulot allaqachon savatda mavjud'
            });
        }

        // Yangi mahsulot qo'shish
        cart.items.push({
            product: productId,
            quantity: quantity
        });

        // Mahsulot stockini kamaytirish
        await Product.findByIdAndUpdate(
            productId,
            { $inc: { stock: -quantity } },
            { new: true }
        );

        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Mahsulot savatga qo\'shildi',
            cart
        });
    } catch (error) {
        console.error('Savatga qo\'shishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// Savatdagi mahsulot miqdorini o'zgartirish
router.put('/cart/:itemId', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const userId = req.user._id;

        // Savatni topish
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Savat topilmadi'
            });
        }

        // Mahsulotni topish
        const cartItem = cart.items.id(req.params.itemId);
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Mahsulot ma'lumotlarini olish
        const product = await Product.findById(cartItem.product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Eski va yangi miqdor farqini hisoblash
        const difference = quantity - cartItem.quantity;

        // Omborda yetarli mahsulot borligini tekshirish
        if (product.stock < difference) {
            return res.status(400).json({
                success: false,
                message: 'Omborda yetarli mahsulot yo\'q'
            });
        }

        // Mahsulot stockini yangilash
        product.stock -= difference;
        await product.save();

        // Savatdagi miqdorni yangilash
        cartItem.quantity = quantity;
        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Mahsulot miqdori yangilandi',
            cart
        });
    } catch (error) {
        console.error('Miqdorni yangilashda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// Savatdan mahsulotni o'chirish
router.delete('/cart/:itemId', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const itemId = req.params.itemId;

        // Savatni topish
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Savat topilmadi'
            });
        }

        // Mahsulotni topish
        const cartItem = cart.items.id(itemId);
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Mahsulot stockini qaytarish
        if (cartItem.product) {
            await Product.findByIdAndUpdate(
                cartItem.product,
                { $inc: { stock: cartItem.quantity } },
                { new: true }
            );
        }

        // Mahsulotni o'chirish
        cart.items.pull(itemId);
        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Mahsulot savatdan o\'chirildi',
            cart
        });
    } catch (error) {
        console.error('Mahsulotni o\'chirishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

module.exports = router;
