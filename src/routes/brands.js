const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Brand modelini import qilish
const Brand = require('../models/brand');

// Barcha brandlarni olish (public)
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find()
            .populate({
                path: 'products',
                select: 'name price images' // faqat kerakli fieldlarni olish
            })
            .sort({ name: 1 }); // nomiga ko'ra tartiblash

        // Har bir brand uchun mahsulotlar sonini qo'shish
        const brandsWithProductCount = brands.map(brand => {
            const brandObj = brand.toObject();
            brandObj.productCount = brand.products ? brand.products.length : 0;
            
            // Mahsulotlar rasmlari uchun to'liq URL
            if (brandObj.products) {
                brandObj.products = brandObj.products.map(product => ({
                    ...product,
                    images: product.images && product.images.length > 0 
                        ? product.images.map(image => `https://adderapi.mixmall.uz/uploads/${image}`)
                        : [`https://adderapi.mixmall.uz/uploads/no-image.jpg`]
                }));
            }
            
            return brandObj;
        });

        res.json({
            success: true,
            data: brandsWithProductCount
        });
    } catch (error) {
        console.error('Brandlarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Brandlarni olishda xatolik yuz berdi',
            error: error.message
        });
    }
});

// Brand ma'lumotlarini ID bo'yicha olish (public)
router.get('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id)
            .populate({
                path: 'products',
                select: 'name price images description',
                options: { sort: { createdAt: -1 } } // eng yangi mahsulotlar
            });

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand topilmadi'
            });
        }

        // Brand ma'lumotlarini formatlash
        const brandObj = brand.toObject();
        brandObj.productCount = brand.products ? brand.products.length : 0;

        // Mahsulotlar rasmlari uchun to'liq URL
        if (brandObj.products) {
            brandObj.products = brandObj.products.map(product => ({
                ...product,
                images: product.images && product.images.length > 0 
                    ? product.images.map(image => `https://adderapi.mixmall.uz/uploads/${image}`)
                    : [`https://adderapi.mixmall.uz/uploads/no-image.jpg`]
            }));
        }

        res.json({
            success: true,
            data: brandObj
        });
    } catch (error) {
        console.error('Brandni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Brandni olishda xatolik yuz berdi',
            error: error.message
        });
    }
});


module.exports = router;
