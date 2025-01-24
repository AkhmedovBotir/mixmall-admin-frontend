const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courier'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        rated: {
            type: Boolean,
            default: false
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String
        }
    }],
    address: {
        address: {
            type: String,
            required: true
        },
        apartment: String,
        entrance: String,
        floor: String,
        domofonCode: String,
        courierComment: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    stockReduced: {
        type: Boolean,
        default: false
    },
    comment: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Model allaqachon yaratilgan bo'lsa, uni qayta yaratmaslik
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
