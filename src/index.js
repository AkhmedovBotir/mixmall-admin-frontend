const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');

const app = express();

// Middleware
// Static fayllar
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CORS
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5173', 'http://127.0.0.1:62755'],  // Frontend URL manzillari
    credentials: true
}));
app.use(express.json());

// MongoDB ga ulanish
connectDB();

// Modellarni yuklash (tartib muhim!)
require('./models/User');
require('./models/category');
require('./models/brand');
require('./models/product');
require('./models/cart');
require('./models/Order');

// Routelarni import qilish
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const addressRoutes = require('./routes/address');
const profileRoutes = require('./routes/profile');
const settingsRoutes = require('./routes/settings');
const brandRoutes = require('./routes/brands');

// Routelarni ishlatish
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/brands', brandRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Serverda xatolik yuz berdi'
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portda ishga tushdi`);
});
