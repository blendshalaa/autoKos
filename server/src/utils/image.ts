import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { env } from '../config/env';

interface ProcessedImage {
    imageUrl: string;
    thumbnailUrl: string;
}

const FULL_SIZE = { width: 1200, height: 900 };
const THUMBNAIL_SIZE = { width: 400, height: 300 };

export const processImage = async (
    file: Express.Multer.File,
    subFolder: string
): Promise<ProcessedImage> => {
    const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR, subFolder);

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fullPath = path.join(uploadDir, `${filename}-full.webp`);
    const thumbPath = path.join(uploadDir, `${filename}-thumb.webp`);

    // Process full-size image
    await sharp(file.buffer)
        .resize(FULL_SIZE.width, FULL_SIZE.height, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(fullPath);

    // Process thumbnail
    await sharp(file.buffer)
        .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, {
            fit: 'cover',
        })
        .webp({ quality: 75 })
        .toFile(thumbPath);

    // Return relative URLs
    const imageUrl = `/${env.UPLOAD_DIR}/${subFolder}/${filename}-full.webp`;
    const thumbnailUrl = `/${env.UPLOAD_DIR}/${subFolder}/${filename}-thumb.webp`;

    return { imageUrl, thumbnailUrl };
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
        const filePath = path.join(process.cwd(), imageUrl);
        await fs.unlink(filePath);
    } catch (error) {
        // Ignore errors if file doesn't exist
        console.error('Error deleting image:', error);
    }
};

export const processAvatar = async (
    file: Express.Multer.File,
    userId: string
): Promise<string> => {
    const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR, 'avatars');

    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${userId}-${Date.now()}.webp`;
    const avatarPath = path.join(uploadDir, filename);

    await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(avatarPath);

    return `/${env.UPLOAD_DIR}/avatars/${filename}`;
};
