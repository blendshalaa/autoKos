import { Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';

export const reportListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const { id: listingId } = req.params;
        const { reason } = req.body;

        // Verify listing exists
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        // Prevent reporting own listing
        if (listing.userId === req.user.id) {
            sendError(res, 'Cannot report your own listing', 400);
            return;
        }

        // Check if user already reported this listing
        const existingReport = await prisma.report.findFirst({
            where: {
                listingId,
                reporterId: req.user.id,
            },
        });

        if (existingReport) {
            sendError(res, 'You have already reported this listing', 409);
            return;
        }

        const report = await prisma.report.create({
            data: {
                listingId,
                reporterId: req.user.id,
                reason,
            },
        });

        sendSuccess(res, { report, message: 'Report submitted successfully' }, 201);
    } catch (error) {
        console.error('ReportListing error:', error);
        sendError(res, 'Failed to submit report', 500);
    }
};
