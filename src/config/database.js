const mongoose = require('mongoose');

// MongoDB ulanish
const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout 5 sekund
            socketTimeoutMS: 45000, // Socket timeout 45 sekund
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('MongoDB ga ulanish muvaffaqiyatli');
    } catch (err) {
        console.error('MongoDB ga ulanishda xatolik:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
