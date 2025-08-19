const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: "dguxtvyut",
  api_key: "952138336163551",
  api_secret: "ppFNE2zTSuTPotEZcemJ_on7iHg",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

module.exports = { storage };
