const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token topilmadi'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new Error('Foydalanuvchi topilmadi');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Avtorizatsiyadan o\'tilmagan'
        });
    }
};

module.exports = auth;
