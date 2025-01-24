const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const config = require('../config/config');

const BASE_URL = 'https://adderapi.mixmall.uz';

// Barcha kategoriyalarni olish
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find()
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'products',
                    model: 'Product',
                    select: 'name price image discount_price discount_percent'
                }
            })
            .sort({ name: 1 });
        
        const categoriesWithUrls = categories.map(category => {
            const categoryObj = category.toObject();
            categoryObj.image = categoryObj.image 
                ? `${BASE_URL}/uploads/${categoryObj.image}`
                : `${BASE_URL}/uploads/no-image.jpg`;
            
            // Subcategory mahsulotlari uchun rasmlarni to'g'rilash
            if (categoryObj.subcategories) {
                categoryObj.subcategories.forEach(sub => {
                    if (sub.products) {
                        sub.products = sub.products.map(product => ({
                            ...product,
                            image: product.image 
                                ? `${BASE_URL}/uploads/${product.image}`
                                : `${BASE_URL}/uploads/no-image.jpg`
                        }));
                    }
                });
            }
            return categoryObj;
        });

        res.json({
            success: true,
            data: categoriesWithUrls
        });
    } catch (error) {
        console.error('Kategoriyalarni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriyalarni olishda xatolik yuz berdi'
        });
    }
});

// Bitta kategoriyani olish
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'products',
                    model: 'Product',
                    select: 'name price image discount_price discount_percent'
                }
            });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategoriya topilmadi'
            });
        }

        const categoryObj = category.toObject();
        categoryObj.image = categoryObj.image 
            ? `${BASE_URL}/uploads/${categoryObj.image}`
            : `${BASE_URL}/uploads/no-image.jpg`;

        // Subcategory mahsulotlari uchun rasmlarni to'g'rilash
        if (categoryObj.subcategories) {
            categoryObj.subcategories.forEach(sub => {
                if (sub.products) {
                    sub.products = sub.products.map(product => ({
                        ...product,
                        image: product.image 
                            ? `${BASE_URL}/uploads/${product.image}`
                            : `${BASE_URL}/uploads/no-image.jpg`
                    }));
                }
            });
        }

        res.json({
            success: true,
            data: categoryObj
        });
    } catch (error) {
        console.error('Kategoriyani olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriyani olishda xatolik yuz berdi'
        });
    }
});

module.exports = router;
