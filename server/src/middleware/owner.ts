import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';
import prisma from '../config/database';

export const listingOwnerMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const listingId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { userId: true },
        });

        if (!listing) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        if (listing.userId !== userId && req.user?.role !== 'ADMIN') {
            sendError(res, 'You do not have permission to modify this listing', 403);
            return;
        }

        next();
    } catch (error) {
        sendError(res, 'Authorization check failed', 500);
    }
};
