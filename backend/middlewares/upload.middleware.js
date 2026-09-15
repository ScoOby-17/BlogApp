// =============================================================================
// upload.middleware.js — Handles file uploads using Multer
// =============================================================================
// This middleware saves uploaded images to the "uploads" folder. It checks that:
// - The file is an allowed image type (jpeg, jpg, png, gif, webp)
// - The file is not larger than 5MB
// - Each file gets a unique name to prevent overwriting
// =============================================================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the absolute path to the uploads directory
const uploadDir = path.join(__dirname, '..', 'uploads');

// Make sure the uploads directory exists (create it if it doesn't)
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.error('Failed to create uploads directory:', err);
}

// -----------------------------------------------------------------------------
// Configure where and how to store uploaded files
// -----------------------------------------------------------------------------
const storage = multer.diskStorage({
  // Set the folder where files will be saved
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  // Generate a unique filename for each upload
  // Format: blog-{timestamp}-{random number}.{extension}
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'blog-' + uniqueSuffix + extension);
  }
});

// -----------------------------------------------------------------------------
// Only allow image files to be uploaded
// -----------------------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  // List of allowed image types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  // Check both the file extension and the MIME type
  const isExtensionValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeTypeValid = allowedTypes.test(file.mimetype);

  if (isMimeTypeValid && isExtensionValid) {
    cb(null, true);   // File is valid — accept it
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// -----------------------------------------------------------------------------
// Create the multer upload middleware with size and type restrictions
// -----------------------------------------------------------------------------
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // Maximum file size: 5MB
  fileFilter: fileFilter
});

// -----------------------------------------------------------------------------
// Error handler specifically for multer upload errors
// Catches errors like "file too large" and sends user-friendly messages
// -----------------------------------------------------------------------------
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (file size, field name, etc.)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    // Other errors (like invalid file type from the fileFilter)
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // No error — continue to the next middleware
  next();
};

export { upload, handleMulterError };
