import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, verifyEmail } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../validators/auth';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        error: 'Too many attempts, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/auth/register
router.post('/register', authLimiter, registerValidation, validate, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, validate, login);

// GET /api/auth/me
router.get('/me', authMiddleware, getMe);

// POST /api/auth/verify-email
router.post('/verify-email', authLimiter, verifyEmail);

export default router;
