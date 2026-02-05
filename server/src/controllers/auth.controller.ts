import { Response } from 'express';
import { AuthRequest, SafeUser } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendVerificationEmail } from '../utils/email';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Helper to remove password from user object
const sanitizeUser = (user: { password: string;[key: string]: unknown }): SafeUser => {
    const { password: _, ...safeUser } = user;
    return safeUser as SafeUser;
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password, name, location } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            sendError(res, 'User with this email already exists', 409);
            return;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create verification token
        const verificationToken = uuidv4();

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                location: location || null,
                verificationToken,
                isVerified: false
            },
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Generate token
        const token = generateToken(user.id, user.email);

        sendSuccess(res, {
            user: sanitizeUser(user),
            token,
            message: 'Registration successful. Please check your email to verify your account.'
        }, 201);
    } catch (error) {
        console.error('Register error:', error);
        sendError(res, 'Registration failed', 500);
    }
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { token } = req.body;

        if (!token) {
            sendError(res, 'Verification token is required', 400);
            return;
        }

        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            sendError(res, 'Invalid or expired verification token', 400);
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });

        sendSuccess(res, { message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify email error:', error);
        sendError(res, 'Verification failed', 500);
    }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            sendError(res, 'Invalid email or password', 401);
            return;
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            sendError(res, 'Invalid email or password', 401);
            return;
        }

        // Generate token
        const token = generateToken(user.id, user.email);

        sendSuccess(res, {
            user: sanitizeUser(user),
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        sendError(res, 'Login failed', 500);
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'User not found', 404);
            return;
        }

        sendSuccess(res, { user: sanitizeUser(req.user) });
    } catch (error) {
        console.error('GetMe error:', error);
        sendError(res, 'Failed to get user info', 500);
    }
};
