const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Store verification codes temporarily (in production, use Redis or similar)
const verificationCodes = new Map();

// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            phoneNumber,
            password
        });

        await user.save();

        // Token yaratish
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'Ro\'yxatdan o\'tish muvaffaqiyatli amalga oshirildi',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    isAdmin: user.isAdmin,
                    image: user.image
                }
            }
        });
    } catch (error) {
        console.error('Ro\'yxatdan o\'tishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Ro\'yxatdan o\'tishda xatolik yuz berdi'
        });
    }
});

// Telefon raqami mavjudligini tekshirish
router.post('/check-phone', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Telefon raqami kiritilmagan'
            });
        }

        const existingUser = await User.findOne({ phoneNumber });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan'
            });
        }

        res.json({
            success: true,
            message: 'Telefon raqami band emas'
        });

    } catch (error) {
        console.error('Telefon raqamini tekshirishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Serverda xatolik yuz berdi'
        });
    }
});

// Login uchun ma'lumotlarni tekshirish va SMS yuborish
router.post('/check-login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Telefon raqami va parol kiritilishi shart'
            });
        }

        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Telefon raqami yoki parol noto\'g\'ri'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Telefon raqami yoki parol noto\'g\'ri'
            });
        }

        // SMS kod generatsiya qilish
        const smsCode = '12345'; // Test uchun statik kod
        verificationCodes.set(phoneNumber, {
            code: smsCode,
            timestamp: Date.now(),
            userData: { phoneNumber, password }
        });

        res.json({
            success: true,
            message: 'Ma\'lumotlar to\'g\'ri'
        });

    } catch (error) {
        console.error('Login tekshirishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Serverda xatolik yuz berdi'
        });
    }
});

// Login SMS kodni tekshirish
router.post('/verify-login', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        
        const verification = verificationCodes.get(phoneNumber);
        
        if (!verification || verification.code !== code) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri SMS kod'
            });
        }

        // SMS kod muddati o'tganini tekshirish (5 daqiqa)
        if (Date.now() - verification.timestamp > 5 * 60 * 1000) {
            verificationCodes.delete(phoneNumber);
            return res.status(400).json({
                success: false,
                message: 'SMS kod muddati tugagan'
            });
        }

        // Foydalanuvchini topish
        const user = await User.findOne({ phoneNumber });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        // Token yaratish
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Verification ma'lumotlarini o'chirish
        verificationCodes.delete(phoneNumber);

        res.json({
            success: true,
            message: 'Tizimga muvaffaqiyatli kirdingiz',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber
            }
        });

    } catch (error) {
        console.error('Login tasdiqlashda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Serverda xatolik yuz berdi'
        });
    }
});

// Foydalanuvchi ma'lumotlarini olish
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                isAdmin: user.isAdmin,
                addresses: user.addresses,
                image: user.image
            }
        });
    } catch (error) {
        console.error('Foydalanuvchi ma\'lumotlarini olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Foydalanuvchi ma\'lumotlarini olishda xatolik yuz berdi'
        });
    }
});

// Forgot password - request
router.post('/forgot-password', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Bu telefon raqam topilmadi'
            });
        }

        // Generate static verification code (12345)
        const verificationCode = "12345";
        
        // Store the verification code (in production, use Redis with expiration)
        verificationCodes.set(phoneNumber, verificationCode);

        res.json({
            success: true,
            message: 'SMS kod yuborildi',
            smsCode: verificationCode // In production, don't send this in response
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Verify SMS code
router.post('/verify-code', async (req, res) => {
    try {
        const { phoneNumber, verificationCode } = req.body;

        // Check if verification code exists and is correct
        const storedCode = verificationCodes.get(phoneNumber);
        
        if (!storedCode || storedCode !== verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri SMS kod'
            });
        }

        res.json({
            success: true,
            message: 'SMS kod tasdiqlandi'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Reset password with verification code
router.post('/reset-password', async (req, res) => {
    try {
        const { phoneNumber, verificationCode, newPassword } = req.body;

        // Check if user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        // Verify the code
        const storedCode = verificationCodes.get(phoneNumber);
        if (!storedCode || storedCode !== verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri SMS kod'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Clear verification code
        verificationCodes.delete(phoneNumber);

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Parol muvaffaqiyatli yangilandi',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                isAdmin: user.isAdmin,
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

module.exports = router;
