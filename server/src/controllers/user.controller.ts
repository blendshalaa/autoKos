import { Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { processAvatar, deleteImage } from '../utils/image';
import prisma from '../config/database';

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                location: true,
                phone: true,
                bio: true,
                avatarUrl: true,
                createdAt: true,
                listings: {
                    where: { isSold: false },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        images: {
                            take: 1,
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });

        if (!user) {
            sendError(res, 'User not found', 404);
            return;
        }

        sendSuccess(res, { user });
    } catch (error) {
        console.error('GetUserById error:', error);
        sendError(res, 'Failed to get user', 500);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const { name, location, phone, bio } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(location !== undefined && { location }),
                ...(phone !== undefined && { phone }),
                ...(bio !== undefined && { bio }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                location: true,
                phone: true,
                bio: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        sendSuccess(res, { user: updatedUser });
    } catch (error) {
        console.error('UpdateProfile error:', error);
        sendError(res, 'Failed to update profile', 500);
    }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        if (!req.file) {
            sendError(res, 'No image file provided', 400);
            return;
        }

        // Delete old avatar if exists
        if (req.user.avatarUrl) {
            await deleteImage(req.user.avatarUrl);
        }

        // Process and save new avatar
        const avatarUrl = await processAvatar(req.file, req.user.id);

        // Update user with new avatar URL
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatarUrl },
            select: {
                id: true,
                email: true,
                name: true,
                location: true,
                phone: true,
                bio: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        sendSuccess(res, { user: updatedUser });
    } catch (error) {
        console.error('UploadAvatar error:', error);
        sendError(res, 'Failed to upload avatar', 500);
    }
};
