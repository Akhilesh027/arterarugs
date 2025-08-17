const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  stock: { type: Number, required: true },
  material: String,
  size: String,
  sizesAvailable: [String],
  shape: String,
  weight: String,
  colors: [String],
  tags: [String],
  description: String,
  images: [String],
  isCustomizable: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);