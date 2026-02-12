import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import userRoutes from './routes/user.routes';
import listingRoutes from './routes/listing.routes';
import messageRoutes from './routes/message.routes';
import favoriteRoutes from './routes/favorite.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler, notFoundHandler } from './middleware/error';

const app: Express = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = env.FRONTEND_URL.split(',');
        // Allow env.FRONTEND_URL origins
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        // Allow Vercel preview/deployment URLs
        const isVercelOrigin = origin.endsWith('.vercel.app');

        if (isVercelOrigin) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Limit each IP to 1000 requests per windowMs (increased for dev)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});
app.use('/api', globalLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
