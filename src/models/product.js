const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount_percent: {
        type: Number,
        default: 0
    },
    discount_price: {
        type: Number,
        default: function() {
            return this.price * (1 - this.discount_percent / 100);
        }
    },
    images: [{
        type: String
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// O'rtacha reytingni hisoblash
productSchema.methods.calculateAverageRating = function() {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
        this.totalRatings = 0;
        return;
    }

    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalRatings = this.ratings.length;
};

// Reyting qo'shish
productSchema.methods.addRating = async function(userId, rating, comment = '') {
    // Foydalanuvchi reytingini tekshirish
    const existingRating = this.ratings.find(r => r.user.toString() === userId.toString());
    
    if (existingRating) {
        // Mavjud reytingni yangilash
        existingRating.rating = rating;
        existingRating.comment = comment;
        existingRating.createdAt = Date.now();
    } else {
        // Yangi reyting qo'shish
        this.ratings.push({
            user: userId,
            rating,
            comment
        });
    }

    // O'rtacha reytingni qayta hisoblash
    this.calculateAverageRating();
    
    return this.save();
};

module.exports = mongoose.model('Product', productSchema);
