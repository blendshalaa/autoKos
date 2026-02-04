import multer from 'multer';
import { Request } from 'express';

// Store files in memory for processing with Sharp
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
): void => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
};

// Avatar upload (single file, 5MB max)
export const avatarUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
}).single('avatar');

// Listing images upload (multiple files, 10MB each, max 10)
export const listingImagesUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
    },
}).array('images', 10);
