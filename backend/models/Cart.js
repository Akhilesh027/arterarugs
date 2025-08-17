const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: String,
    productId: String,
    quantity: Number,
    customization: Object, // add this field
    customPrice: Number    // for special price
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
