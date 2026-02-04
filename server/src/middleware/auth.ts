import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import prisma from '../config/database';

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const payload = verifyToken(token);

        if (!payload) {
            sendError(res, 'Invalid or expired token', 401);
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            sendError(res, 'User not found', 401);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        sendError(res, 'Authentication failed', 401);
    }
};

// Optional auth - doesn't fail if no token, but attaches user if present
export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (token) {
            const payload = verifyToken(token);
            if (payload) {
                const user = await prisma.user.findUnique({
                    where: { id: payload.userId },
                });
                if (user) {
                    req.user = user;
                }
            }
        }

        next();
    } catch {
        next();
    }
};
