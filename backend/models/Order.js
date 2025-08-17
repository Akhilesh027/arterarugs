const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cartItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      customPrice: { type: Number }
    }
  ],
  shippingInfo: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String
  },
  deliveryMethod: { type: String, default: 'standard' },
  paymentInfo: {
    cardNumber: String,
    cardName: String,
    expiry: String,
    cvv: String
  },
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
