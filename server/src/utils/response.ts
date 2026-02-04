import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response => {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };
    return res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode = 400): Response => {
    const response: ApiResponse = {
        success: false,
        error,
    };
    return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
    res: Response,
    items: T[],
    total: number,
    page: number,
    limit: number
): Response => {
    return sendSuccess(res, {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
};
