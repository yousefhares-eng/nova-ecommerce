/**
 * Multer configuration for product image uploads
 * Stores files in public/uploads/products
 */

const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = (file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i) || [])[1] || 'jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
});

module.exports = upload;
