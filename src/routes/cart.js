const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const config = require('../config/config');

const BASE_URL = 'https://adderapi.mixmall.uz';

// Modellarni import qilish
const Cart = mongoose.model('Cart');
const Product = mongoose.model('Product');

// Savatni olish
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name description price discount_price quantity images'
            });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
            await cart.save();
        }

        // Mahsulot rasmlarini to'g'ri formatlash
        cart = cart.toObject();
        cart.items = cart.items.map(item => {
            if (item.product) {
                if (item.product.images && item.product.images.length > 0) {
                    item.product.images = item.product.images.map(image => 
                        image.startsWith('http') ? image : `${BASE_URL}/uploads/${image}`
                    );
                } else {
                    item.product.images = [`${BASE_URL}/images/default-product.jpg`];
                }
            }
            return item;
        });

        res.json({
            success: true,
            cart: cart
        });
    } catch (error) {
        console.error('Savatni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Savatni olishda xatolik yuz berdi'
        });
    }
});

// Savatga mahsulot qo'shish
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user._id;

        // Mahsulotni tekshirish
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Mahsulot omborda borligini tekshirish
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Mahsulot yetarli miqdorda mavjud emas'
            });
        }

        // Savatni topish yoki yaratish
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Mahsulot savatda borligini tekshirish
        const existingItem = cart.items.find(item => 
            item.product.toString() === productId.toString()
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Bu mahsulot allaqachon savatda mavjud'
            });
        }

        // Yangi mahsulotni qo'shish
        cart.items.push({
            product: productId,
            quantity: quantity
        });

        await cart.save();

        // To'liq ma'lumotlar bilan qaytarish
        cart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name description price discount_price quantity images'
        });

        // Mahsulot rasmlarini to'g'ri formatlash
        cart = cart.toObject();
        cart.items = cart.items.map(item => {
            if (item.product) {
                if (item.product.images && item.product.images.length > 0) {
                    item.product.images = item.product.images.map(image => 
                        image.startsWith('http') ? image : `${BASE_URL}/uploads/${image}`
                    );
                } else {
                    item.product.images = [`${BASE_URL}/images/default-product.jpg`];
                }
            }
            return item;
        });

        res.json({
            success: true,
            message: 'Mahsulot savatga qo\'shildi',
            cart: cart
        });
    } catch (error) {
        console.error('Savatga qo\'shishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Savatga qo\'shishda xatolik yuz berdi'
        });
    }
});

// Mahsulot miqdorini yangilash
router.put('/item/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        // Miqdorni tekshirish
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri miqdor kiritildi'
            });
        }

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

        // Mahsulot omborda borligini tekshirish
        const product = await Product.findById(cartItem.product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        // Stock tekshiruvi
        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Kechirasiz, bu mahsulot sotuvda yo\'q'
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Kechirasiz, omborda faqat ${product.stock} ta mahsulot mavjud`,
                details: {
                    title: 'Miqdor ko\'p',
                    message: `Siz ${quantity} ta mahsulot so'radingiz, lekin omborda faqat ${product.stock} ta mavjud. Iltimos, kamroq miqdor tanlang.`,
                    type: 'quantity_exceeded',
                    available: product.stock,
                    requested: quantity
                }
            });
        }

        // Miqdorni yangilash
        cartItem.quantity = quantity;
        await cart.save();

        // To'liq ma'lumotlar bilan qaytarish
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name description price discount_price stock images'
        });

        // Mahsulot rasmlarini to'g'ri formatlash
        const formattedCart = updatedCart.toObject();
        formattedCart.items = formattedCart.items.map(item => {
            if (item.product) {
                if (item.product.images && item.product.images.length > 0) {
                    item.product.images = item.product.images.map(image => 
                        image.startsWith('http') ? image : `${BASE_URL}/uploads/${image}`
                    );
                } else {
                    item.product.images = [`${BASE_URL}/images/default-product.jpg`];
                }
            }
            return item;
        });

        res.json({
            success: true,
            message: 'Mahsulot miqdori yangilandi',
            cart: formattedCart
        });
    } catch (error) {
        console.error('Miqdorni yangilashda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Miqdorni yangilashda xatolik yuz berdi'
        });
    }
});

// Mahsulotni savatdan o'chirish
router.delete('/item/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user._id;

        // Savatni topish
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Savat topilmadi'
            });
        }

        // Mahsulotni o'chirish
        cart.items.pull({ _id: itemId });
        await cart.save();

        // To'liq ma'lumotlar bilan qaytarish
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name description price discount_price quantity images'
        });

        res.json({
            success: true,
            message: 'Mahsulot savatdan o\'chirildi',
            cart: updatedCart
        });
    } catch (error) {
        console.error('O\'chirishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'O\'chirishda xatolik yuz berdi'
        });
    }
});

module.exports = router;
