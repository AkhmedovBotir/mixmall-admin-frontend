const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: true
});

// Modelni tekshirish va qayta e'lon qilmaslik
let Brand;
try {
    Brand = mongoose.model('Brand');
} catch (error) {
    Brand = mongoose.model('Brand', brandSchema);
}

module.exports = Brand;
