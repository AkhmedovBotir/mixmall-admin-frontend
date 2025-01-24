const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt'); // bcryptni import qilish
const config = require('../config/config');

const BASE_URL = 'https://adderapi.mixmall.uz';

const router = express.Router();

// Eski rasmni o'chirish funksiyasi
const deleteOldImage = async (imagePath) => {
    // Default rasmni o'chirmaslik
    if (imagePath === '/uploads/default-profile.png') {
        return;
    }

    // Rasm yo'lini to'g'rilash
    const fullPath = path.join(__dirname, '../../public', imagePath);
    
    try {
        // Fayl mavjudligini tekshirish
        if (fs.existsSync(fullPath)) {
            // Faylni o'chirish
            await fs.promises.unlink(fullPath);
            console.log('Eski rasm o\'chirildi:', fullPath);
        }
    } catch (error) {
        console.error('Rasmni o\'chirishda xatolik:', error);
    }
};

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'public/uploads';
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
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
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

// Get current profile settings
router.get('/profile', auth, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            profile: {
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

// Update profile settings
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['firstName', 'lastName', 'phone'];
        const updateKeys = Object.keys(updates);

        // Check if updates are valid
        const isValidOperation = updateKeys.every(key => allowedUpdates.includes(key));
        if (!isValidOperation) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri yangilash maydonlari'
            });
        }

        // Update user fields
        updateKeys.forEach(key => {
            if (key === 'phone') {
                req.user.phoneNumber = updates[key];
            } else {
                req.user[key] = updates[key];
            }
        });

        await req.user.save();

        res.json({
            success: true,
            message: 'Profil muvaffaqiyatli yangilandi',
            profile: {
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phone: req.user.phoneNumber,
                image: req.user.image
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

// Update profile image
router.post('/profile/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Rasm yuklanmadi'
            });
        }

        // Eski rasmni o'chirish
        if (req.user.image) {
            await deleteOldImage(req.user.image);
        }

        // Save image path to user
        req.user.image = `/uploads/${req.file.filename}`;
        await req.user.save();

        res.json({
            success: true,
            message: 'Rasm muvaffaqiyatli yuklandi',
            image: req.user.image
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Update password
router.put('/password', auth, async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Yangi parol kiritilmagan'
            });
        }

        // Yangi parolni hash qilish
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Parolni yangilash
        req.user.password = hashedPassword;
        await req.user.save();

        res.json({
            success: true,
            message: 'Parol muvaffaqiyatli yangilandi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

module.exports = router;
