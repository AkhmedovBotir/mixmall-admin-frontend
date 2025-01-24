const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        required: false
    },
    entrance: {
        type: String,
        required: false
    },
    floor: {
        type: String,
        required: false
    },
    domofonCode: {
        type: String,
        required: false
    },
    courierComment: {
        type: String,
        required: false
    },
    isMain: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
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
    image: {
        type: String,
        default: '/uploads/default-profile.png'
    },
    images: {
        type: [String],
        default: []
    },
    addresses: [addressSchema]
}, {
    timestamps: true
});

// Parolni hashlash
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Asosiy manzilni olish metodi
userSchema.methods.getDefaultAddress = function() {
    return this.addresses.find(addr => addr.isMain);
};

module.exports = mongoose.model('User', userSchema);
