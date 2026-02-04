import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Start server
        app.listen(env.PORT, () => {
            console.log(`🚀 Server running on port ${env.PORT}`);
            console.log(`📍 Environment: ${env.NODE_ENV}`);
            console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
            console.log(`📂 API: http://localhost:${env.PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (): Promise<void> => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
