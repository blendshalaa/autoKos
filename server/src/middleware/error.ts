import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface CustomError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    err: CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', err);

    // Prisma unique constraint violation
    if (err.code === 'P2002') {
        sendError(res, 'A record with this value already exists', 409);
        return;
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        sendError(res, 'Record not found', 404);
        return;
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    sendError(res, message, statusCode);
};

// Not found handler
export const notFoundHandler = (_req: Request, res: Response): void => {
    sendError(res, 'Route not found', 404);
};
