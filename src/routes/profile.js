const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const BASE_URL = 'https://adderapi.mixmall.uz';

// Rasm yuklash uchun multer konfiguratsiyasi
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Faqat rasm (JPG, JPEG, PNG) fayllarini yuklash mumkin!'));
    }
});

const router = express.Router();

// Get profile
router.get('/', auth, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phoneNumber,
                image: user.image
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Update profile
router.put('/', auth, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = req.user;

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        await user.save();

        res.json({
            success: true,
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phoneNumber,
                image: user.image
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Eski rasmni o'chirish funksiyasi
async function deleteOldImage(imagePath) {
    // Default rasmni o'chirmaslik uchun tekshirish
    if (imagePath && imagePath !== '/uploads/default-profile.png') {
        const fullPath = path.join(__dirname, '../../public', imagePath);
        try {
            // Fayl mavjudligini tekshirish
            if (fs.existsSync(fullPath)) {
                // Faylni o'chirish
                await fs.promises.unlink(fullPath);
            }
        } catch (error) {
            console.error('Eski rasmni o\'chirishda xatolik:', error);
        }
    }
}

// Update profile image
router.put('/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Rasm yuklanmadi'
            });
        }

        const user = req.user;
        
        // Eski rasmni o'chirish
        await deleteOldImage(user.image);

        // Yangi rasm yo'lini saqlash
        user.image = '/uploads/' + req.file.filename;
        await user.save();

        res.json({
            success: true,
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phoneNumber,
                image: user.image
            }
        });
    } catch (error) {
        // Xatolik bo'lsa, yangi yuklangan rasmni o'chirish
        if (req.file) {
            const filePath = path.join(__dirname, '../../public/uploads', req.file.filename);
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                }
            } catch (err) {
                console.error('Xatolik yuz berganda rasmni o\'chirishda muammo:', err);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

module.exports = router;
