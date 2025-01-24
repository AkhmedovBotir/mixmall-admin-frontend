const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = mongoose.model('User');
const config = require('../config/config');
const { UPLOADS_PATH, DEFAULT_IMAGE } = config;
const BASE_URL = 'https://adderapi.mixmall.uz';

// Modellarni import qilish
require('../models/Order');
require('../models/Courier');
require('../models/counter');

// Modellarni olish
const Cart = mongoose.model('Cart');
const Order = mongoose.model('Order');
const Product = mongoose.model('Product');
const Counter = mongoose.model('Counter');

// Keyingi buyurtma ID ni olish
async function getNextOrderId() {
    try {
        const counter = await Counter.findByIdAndUpdate(
            'orderId',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        return String(counter.seq);
    } catch (error) {
        console.error('Buyurtma ID olishda xatolik:', error);
        throw error;
    }
}

// Buyurtma yaratish
router.post('/create', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Foydalanuvchi ma'lumotlarini olish
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        // Asosiy manzilni tekshirish
        const defaultAddress = user.addresses.find(addr => addr.isMain);
        if (!defaultAddress) {
            return res.status(400).json({
                success: false,
                message: 'Asosiy manzil ko\'rsatilmagan. Iltimos, profil sahifasida manzil qo\'shing'
            });
        }

        // Foydalanuvchi savatini olish
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Savat bo\'sh'
            });
        }

        // Mahsulotlar omborda borligini tekshirish
        for (const item of cart.items) {
            const product = item.product;
            
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: 'Mahsulot topilmadi'
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `"${product.name}" mahsulotidan faqat ${product.stock} ta qolgan`
                });
            }
        }

        // Keyingi buyurtma ID ni olish
        const nextId = await getNextOrderId();

        // Buyurtma yaratish
        const order = new Order({
            orderId: nextId,
            user: userId,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.discount_price || item.product.price
            })),
            totalPrice: cart.items.reduce((total, item) => {
                return total + (item.quantity * (item.product.discount_price || item.product.price));
            }, 0),
            address: {
                address: defaultAddress.address,
                apartment: defaultAddress.apartment || '',
                entrance: defaultAddress.entrance || '',
                floor: defaultAddress.floor || '',
                domofonCode: defaultAddress.domofonCode || '',
                courierComment: defaultAddress.courierComment || ''
            },
            status: 'pending'
        });

        // Mahsulotlar sonini kamaytirish
        const updatePromises = cart.items.map(item => {
            return Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
        });

        await Promise.all(updatePromises);
        await order.save();

        // Savatni tozalash
        cart.items = [];
        await cart.save();

        // To'liq ma'lumotlar bilan qaytarish
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'items.product',
                select: 'name description price discount_price images'
            });

        res.json({
            success: true,
            message: 'Buyurtma muvaffaqiyatli joylashtirildi',
            order: populatedOrder
        });
    } catch (error) {
        console.error('Buyurtma yaratishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Buyurtma yaratishda xatolik yuz berdi'
        });
    }
});

// Admin uchun buyurtma holatini o'zgartirish
router.put('/:orderId/status', auth, async (req, res) => {
    try {
        // Admin ekanligini tekshirish
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Bu amalni faqat admin bajarishi mumkin'
            });
        }

        const { status } = req.body;
        const order = await Order.findById(req.params.orderId).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Buyurtma topilmadi'
            });
        }

        // Eski status
        const oldStatus = order.status;
        
        // Yangi status
        order.status = status;

        // Agar buyurtma bekor qilingan bo'lsa
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            // Har bir mahsulot uchun stockni qaytarish
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }
        // Agar buyurtma qayta aktivlashtirilsa
        else if (oldStatus === 'cancelled' && status !== 'cancelled') {
            // Har bir mahsulot uchun stockni tekshirish va kamaytirish
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    if (product.stock < item.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `${product.name} mahsuloti omborda yetarli emas`
                        });
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
            }
        }

        await order.save();

        res.json({
            success: true,
            message: 'Buyurtma statusi yangilandi',
            order
        });
    } catch (error) {
        console.error('Buyurtma statusini yangilashda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// Foydalanuvchi buyurtmalarini olish
router.get('/user', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name price discount_price images'
            })
            .populate({
                path: 'courier',
                select: 'firstName lastName phoneNumber vehicle'
            })
            .sort({ createdAt: -1 }); // Eng yangi buyurtmalar birinchi

        // Mahsulot rasmlarini to'g'ri formatlash
        const formattedOrders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.items = orderObj.items.map(item => {
                if (item.product && item.product.images) {
                    item.product.images = item.product.images.length > 0
                        ? item.product.images.map(image => `${BASE_URL}/uploads/${image}`)
                        : [`${BASE_URL}/images/default-product.jpg`];
                }
                return item;
            });
            return orderObj;
        });

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Buyurtmalarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Buyurtmalarni olishda xatolik yuz berdi'
        });
    }
});

// Admin uchun barcha buyurtmalarni olish
router.get('/all', auth, async (req, res) => {
    try {
        // Admin ekanligini tekshirish
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Ruxsat berilmagan'
            });
        }

        const orders = await Order.find()
            .populate('userId', 'firstName lastName phoneNumber addresses')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Buyurtmalarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Buyurtmalarni olishda xatolik yuz berdi'
        });
    }
});

// Mahsulotni baholash
router.post('/:orderId/rate-product/:productId', auth, async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const { rating, comment } = req.body;

        // Reyting qiymatini tekshirish
        const ratingValue = parseInt(rating);
        if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
            return res.status(400).json({
                success: false,
                message: 'Reyting 1 dan 5 gacha bo\'lishi kerak'
            });
        }

        // Buyurtmani topish
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Buyurtma topilmadi'
            });
        }

        // Buyurtma foydalanuvchiga tegishli ekanligini tekshirish
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bu buyurtma sizga tegishli emas'
            });
        }

        // Mahsulot buyurtmada mavjudligini tekshirish
        const orderItem = order.items.find(item => 
            item.product && item.product.toString() === productId
        );
        
        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: 'Bu mahsulot sizning buyurtmangizda mavjud emas'
            });
        }

        // Mahsulotni topish
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Reytingni qo'shish
        await product.addRating(req.user._id, ratingValue, comment, orderId);

        res.status(200).json({
            success: true,
            message: 'Reyting muvaffaqiyatli qo\'shildi',
            data: {
                averageRating: product.averageRating,
                totalRatings: product.totalRatings
            }
        });
    } catch (error) {
        console.error('Mahsulotni baholashda xatolik:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Mahsulotni baholashda xatolik yuz berdi'
        });
    }
});

// Mahsulot reytinglarini olish
router.get('/:orderId/product/:productId/ratings', auth, async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        const product = await Product.findById(productId)
            .populate({
                path: 'ratings.user',
                select: 'name'
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        const ratings = product.ratings.filter(r => r.orderId.toString() === orderId);

        res.status(200).json({
            success: true,
            data: {
                ratings,
                averageRating: product.averageRating,
                totalRatings: product.totalRatings
            }
        });
    } catch (error) {
        console.error('Reytinglarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Reytinglarni olishda xatolik yuz berdi'
        });
    }
});

// Buyurtma mahsulotlarining reytinglarini olish
router.get('/:orderId/ratings', auth, async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri buyurtma ID'
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId: req.user._id
        }).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Buyurtma topilmadi'
            });
        }

        // Har bir mahsulot uchun reyting ma'lumotlarini olish
        const ratingsInfo = await Promise.all(order.items.map(async (item) => {
            if (!item.product) {
                return {
                    product: null,
                    name: 'Mahsulot topilmadi',
                    averageRating: 0,
                    totalRatings: 0,
                    userRating: null,
                    userComment: null
                };
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return {
                    product: item.product,
                    name: 'Mahsulot topilmadi',
                    averageRating: 0,
                    totalRatings: 0,
                    userRating: null,
                    userComment: null
                };
            }

            // Foydalanuvchi reytingini topish
            let userRating = null;
            if (product.ratings && Array.isArray(product.ratings)) {
                userRating = product.ratings.find(r => 
                    r.user.toString() === req.user._id.toString() && 
                    r.orderId && r.orderId.toString() === orderId
                );
            }

            return {
                product: item.product,
                name: item.product.name,
                averageRating: product.averageRating || 0,
                totalRatings: product.totalRatings || 0,
                userRating: userRating ? userRating.rating : null,
                userComment: userRating ? userRating.comment : null
            };
        }));

        res.json({
            success: true,
            data: ratingsInfo
        });

    } catch (error) {
        console.error('Reytinglarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Reytinglarni olishda xatolik yuz berdi',
            error: error.message
        });
    }
});

// Buyurtmalar ro'yxatini olish
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name images price discount_price'
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Buyurtmalar ro\'yxatini olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Buyurtmalar ro\'yxatini olishda xatolik yuz berdi'
        });
    }
});

// Buyurtma mahsulotini baholash
router.put('/:orderId/item/:itemId/rate', auth, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        // Reyting qiymatini tekshirish
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri reyting qiymati'
            });
        }

        // Buyurtmani topish
        const order = await Order.findOne({ 
            _id: orderId,
            user: userId,
            status: 'delivered'
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Buyurtma topilmadi yoki yetkazib berilmagan'
            });
        }

        // Buyurtma mahsulotini topish
        const orderItem = order.items.id(itemId);
        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: 'Buyurtma mahsuloti topilmadi'
            });
        }

        // Mahsulotni topish
        const product = await Product.findById(orderItem.product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Mavjud reytingni tekshirish
        const existingRatingIndex = product.ratings.findIndex(
            r => r.user.toString() === userId.toString()
        );

        let newRatings = [...product.ratings];
        if (existingRatingIndex !== -1) {
            // Mavjud reytingni yangilash
            newRatings[existingRatingIndex] = {
                ...newRatings[existingRatingIndex],
                rating,
                comment,
                createdAt: new Date()
            };
        } else {
            // Yangi reyting qo'shish
            newRatings.push({
                user: userId,
                rating,
                comment,
                createdAt: new Date()
            });
        }

        // O'rtacha reytingni hisoblash
        const totalRating = newRatings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = newRatings.length > 0 ? totalRating / newRatings.length : 0;

        // Mahsulot reytingini yangilash
        await Product.updateOne(
            { _id: product._id },
            { 
                $set: {
                    ratings: newRatings,
                    averageRating,
                    totalRatings: newRatings.length
                }
            }
        );

        // Buyurtma mahsulotini yangilash
        orderItem.rating = rating;
        orderItem.comment = comment;
        orderItem.rated = true;
        await order.save();

        res.json({
            success: true,
            message: 'Mahsulot muvaffaqiyatli baholandi',
            data: {
                rating,
                comment,
                product: {
                    _id: product._id,
                    name: product.name,
                    averageRating,
                    totalRatings: newRatings.length
                }
            }
        });

    } catch (error) {
        console.error('Mahsulotni baholashda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Mahsulotni baholashda xatolik yuz berdi'
        });
    }
});

module.exports = router;
