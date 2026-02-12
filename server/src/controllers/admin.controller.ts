import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalListings = await prisma.listing.count();
        const activeListings = await prisma.listing.count({ where: { status: 'ACTIVE' } });
        const totalMessages = await prisma.message.count();
        const reportedListings = await prisma.listing.count({
            where: { reports: { some: {} } }
        });

        sendSuccess(res, {
            users: totalUsers,
            listings: totalListings,
            activeListings,
            messages: totalMessages,
            reports: reportedListings
        });
    } catch (error) {
        sendError(res, 'Failed to fetch stats');
    }
};

export const getReports = async (req: AuthRequest, res: Response) => {
    try {
        const reports = await prisma.report.findMany({
            include: {
                listing: {
                    select: { id: true, make: true, model: true, userId: true }
                },
                reporter: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        sendSuccess(res, reports);
    } catch (error) {
        sendError(res, 'Failed to fetch reports');
    }
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'dismiss' or 'delete_listing'

        if (action === 'delete_listing') {
            const report = await prisma.report.findUnique({ where: { id }, include: { listing: true } });
            if (!report) return sendError(res, 'Report not found', 404);

            await prisma.$transaction([
                prisma.listing.delete({ where: { id: report.listingId } }),
                // Report is deleted cascade/automatically or explicitly?
                // listing delete cascade deletes reports usually, checking schema...
                // Yes: reports Report[] on Listing. Report has listing Listing @relation(..., onDelete: Cascade)
            ]);
            sendSuccess(res, { message: 'Listing deleted and report resolved' });
        } else {
            // Dismiss - just delete the report?
            await prisma.report.delete({ where: { id } });
            sendSuccess(res, { message: 'Report dismissed' });
        }
    } catch (error) {
        sendError(res, 'Failed to resolve report');
    }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBanned: true,
                createdAt: true,
                _count: {
                    select: { listings: true }
                }
            }
        });
        sendSuccess(res, users);
    } catch (error) {
        sendError(res, 'Failed to fetch users');
    }
};

export const toggleBanUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return sendError(res, 'User not found', 404);

        if (user.role === 'ADMIN') return sendError(res, 'Cannot ban admin', 400);

        const updated = await prisma.user.update({
            where: { id },
            data: { isBanned: !user.isBanned }
        });

        sendSuccess(res, { message: `User ${updated.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: updated.isBanned });
    } catch (error) {
        sendError(res, 'Failed to toggle ban');
    }
};
