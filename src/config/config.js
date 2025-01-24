module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    BASE_URL: 'https://adderapi.mixmall.uz',
    UPLOADS_PATH: '/uploads/',
    DEFAULT_IMAGE: '/uploads/no-image.jpg'
};
