import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
    DATABASE_URL: string;
    JWT_SECRET: string;
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';
    FRONTEND_URL: string;
    UPLOAD_DIR: string;
}

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export const env: EnvConfig = {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
};

export default env;
