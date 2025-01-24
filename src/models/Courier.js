const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    deliveredOrders: {
        type: Number,
        default: 0
    },
    vehicle: {
        name: {
            type: String,
            required: true
        },
        number: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
});

// Model allaqachon yaratilgan bo'lsa, uni qayta yaratmaslik
module.exports = mongoose.models.Courier || mongoose.model('Courier', courierSchema);
