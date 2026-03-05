import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

interface ProcessedImage {
    imageUrl: string;
    thumbnailUrl: string;
}

/**
 * Upload a buffer to Cloudinary and return the URL.
 */
const uploadToCloudinary = (
    buffer: Buffer,
    folder: string,
    transformation?: object
): Promise<{ secure_url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `autokos/${folder}`,
                format: 'webp',
                ...(transformation && { transformation }),
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Cloudinary upload failed'));
                } else {
                    resolve({ secure_url: result.secure_url, public_id: result.public_id });
                }
            }
        );

        const readable = Readable.from(buffer);
        readable.pipe(uploadStream);
    });
};

/**
 * Extract the Cloudinary public_id from a URL.
 * e.g. https://res.cloudinary.com/xxx/image/upload/v123/autokos/listings/abc/file.webp
 *   -> autokos/listings/abc/file
 */
const extractPublicId = (url: string): string | null => {
    try {
        const match = url.match(/\/upload\/(?:v\d+\/)?(autokos\/.+?)(?:\.\w+)?$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
};

export const processImage = async (
    file: Express.Multer.File,
    subFolder: string
): Promise<ProcessedImage> => {
    // Upload full-size image (max 1200x900)
    const fullResult = await uploadToCloudinary(file.buffer, subFolder, {
        width: 1200,
        height: 900,
        crop: 'limit',
        quality: 'auto:good',
    });

    // Upload thumbnail (400x300 cover crop)
    const thumbResult = await uploadToCloudinary(file.buffer, `${subFolder}/thumbs`, {
        width: 400,
        height: 300,
        crop: 'fill',
        quality: 'auto:eco',
    });

    return {
        imageUrl: fullResult.secure_url,
        thumbnailUrl: thumbResult.secure_url,
    };
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
        // Only attempt Cloudinary deletion for Cloudinary URLs
        if (imageUrl.includes('res.cloudinary.com')) {
            const publicId = extractPublicId(imageUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

export const processAvatar = async (
    file: Express.Multer.File,
    userId: string
): Promise<string> => {
    const result = await uploadToCloudinary(file.buffer, 'avatars', {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good',
    });

    return result.secure_url;
};
