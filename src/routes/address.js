const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Barcha manzillarni olish
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            data: user.addresses || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Yangi manzil qo'shish
router.post('/', auth, async (req, res) => {
    try {
        const {
            address,
            apartment,
            entrance,
            floor,
            domofonCode,
            courierComment,
            isMain
        } = req.body;

        if (!address) {
            return res.status(400).json({
                success: false,
                message: 'Manzil kiritilmagan'
            });
        }

        const user = await User.findById(req.user._id);

        // Agar bu birinchi manzil bo'lsa, uni asosiy qilish
        const isFirstAddress = !user.addresses || user.addresses.length === 0;

        const newAddress = {
            address,
            apartment,
            entrance,
            floor,
            domofonCode,
            courierComment,
            isMain: isMain || isFirstAddress
        };

        // Agar yangi manzil asosiy bo'lsa, boshqa manzillarni asosiy emas qilish
        if (newAddress.isMain && user.addresses) {
            user.addresses.forEach(addr => {
                addr.isMain = false;
            });
        }

        if (!user.addresses) {
            user.addresses = [];
        }
        user.addresses.push(newAddress);
        await user.save();

        res.json({
            success: true,
            message: 'Manzil muvaffaqiyatli qo\'shildi',
            data: newAddress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Manzilni yangilash
router.put('/:addressId', auth, async (req, res) => {
    try {
        const { addressId } = req.params;
        const updates = req.body;
        
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Manzil topilmadi'
            });
        }

        // Manzilni yangilash
        Object.keys(updates).forEach(key => {
            if (key !== '_id') {
                address[key] = updates[key];
            }
        });

        // Agar bu manzil asosiy bo'lsa, boshqalarini asosiy emas qilish
        if (updates.isMain) {
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isMain = false;
                }
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Manzil muvaffaqiyatli yangilandi',
            data: address
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Bitta manzilni olish
router.get('/:addressId', auth, async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Manzil topilmadi'
            });
        }

        res.json({
            success: true,
            data: address
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Manzilni o'chirish
router.delete('/:addressId', auth, async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        
        const addressToRemove = user.addresses.id(addressId);
        if (!addressToRemove) {
            return res.status(404).json({
                success: false,
                message: 'Manzil topilmadi'
            });
        }

        // Manzilni o'chirish
        addressToRemove.remove();

        // Agar o'chirilgan manzil asosiy bo'lsa va boshqa manzillar bo'lsa,
        // birinchi manzilni asosiy qilish
        if (addressToRemove.isMain && user.addresses.length > 0) {
            user.addresses[0].isMain = true;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Manzil muvaffaqiyatli o\'chirildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server xatosi',
            error: error.message
        });
    }
});

// Asosiy manzilni olish
router.get('/main', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user.addresses || user.addresses.length === 0) {
            return res.json({
                success: true,
                data: null
            });
        }

        const mainAddress = user.addresses.find(addr => addr.isMain);
        
        res.json({
            success: true,
            data: mainAddress || user.addresses[0] // Agar asosiy manzil bo'lmasa, birinchi manzilni qaytarish
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
