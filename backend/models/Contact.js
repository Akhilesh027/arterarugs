const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  requirement: { type: String, required: true },
  bestTime: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);
