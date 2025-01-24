const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

// Savatdagi mahsulotlarning umumiy narxini hisoblash
cartSchema.methods.calculateTotals = async function() {
    await this.populate('items.product');
    
    let totalPrice = 0;
    let totalDiscount = 0;

    this.items.forEach(item => {
        if (item.product) {
            const itemPrice = item.product.price * item.quantity;
            totalPrice += itemPrice;

            if (item.product.discount_price) {
                const itemDiscount = (item.product.price - item.product.discount_price) * item.quantity;
                totalDiscount += itemDiscount;
            }
        }
    });

    this.totalPrice = totalPrice;
    this.totalDiscount = totalDiscount;
};

// Savatni yangilashdan oldin narxlarni qayta hisoblash
cartSchema.pre('save', async function(next) {
    if (this.isModified('items')) {
        await this.calculateTotals();
    }
    next();
});

// Model allaqachon yaratilgan bo'lsa, uni qayta yaratmaslik
module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
