const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
