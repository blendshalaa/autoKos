import { Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const { listingId } = req.params;

        // Check if listing exists
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_listingId: {
                    userId: req.user.id,
                    listingId,
                },
            },
        });

        if (existing) {
            // Remove favorite
            await prisma.favorite.delete({ where: { id: existing.id } });
            sendSuccess(res, { isFavorited: false });
        } else {
            // Add favorite
            await prisma.favorite.create({
                data: {
                    userId: req.user.id,
                    listingId,
                },
            });
            sendSuccess(res, { isFavorited: true }, 201);
        }
    } catch (error) {
        console.error('ToggleFavorite error:', error);
        sendError(res, 'Failed to toggle favorite', 500);
    }
};

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                listing: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                        images: {
                            take: 1,
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });

        const listings = favorites.map(f => f.listing);
        sendSuccess(res, { listings, favoriteIds: favorites.map(f => f.listingId) });
    } catch (error) {
        console.error('GetFavorites error:', error);
        sendError(res, 'Failed to get favorites', 500);
    }
};

export const getFavoriteIds = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user.id },
            select: { listingId: true },
        });

        sendSuccess(res, { favoriteIds: favorites.map(f => f.listingId) });
    } catch (error) {
        console.error('GetFavoriteIds error:', error);
        sendError(res, 'Failed to get favorite IDs', 500);
    }
};
