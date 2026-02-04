import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

const JWT_EXPIRY = '7d';

export const generateToken = (userId: string, email: string): string => {
    const payload: JwtPayload = { userId, email };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
};
