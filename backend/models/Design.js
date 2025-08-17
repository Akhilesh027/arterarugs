// models/Design.js
const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
   
  },
  name: {
    type: String,
    required: true
  },
  configuration: {
    shape: String,
    size: {
      width: Number,
      height: Number
    },
    material: String,
    colors: [String],
    pattern: String,
    logo: String
  },
  price: {
    type: Number,
    required: true
  },
  baseProduct: {
    name: String,
    images: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Design', DesignSchema);