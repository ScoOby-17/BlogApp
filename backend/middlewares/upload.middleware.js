// This middleware handles file uploads using Multer
// Saves uploaded images to the 'uploads' folder and validates file types/sizes

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { error } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Create absolute path to backend/uploads directory
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure the directory exists
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.error('Failed to create uploads directory:', err);
}

/**
 * Configure where and how to store uploaded files
 */
const storage = multer.diskStorage({
  // Set the folder where files will be saved
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Generate a unique filename for each upload
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Check if the uploaded file is an allowed image type
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); // File is valid
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

/**
 * Create the multer upload middleware with file size and type restrictions
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per file
  fileFilter: fileFilter
});

/**
 * Error handling middleware specifically for multer upload errors
 * Catches errors like "file too large" and sends user-friendly messages
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (file size, field name, etc.)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return error(res, 'File size too large. Maximum 5MB allowed.', 400);
    }
    return error(res, err.message, 400);
  } else if (err) {
    // Other errors (like invalid file type from fileFilter)
    return error(res, err.message, 400);
  }
  next(); // No error, continue
};

export { upload, handleMulterError };