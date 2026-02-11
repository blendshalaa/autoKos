import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from './config/database';
import env from './config/env';

interface AuthPayload {
    userId: string;
    email: string;
}

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: env.FRONTEND_URL,
            methods: ['GET', 'POST'],
        },
    });

    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            console.log('❌ Socket connection rejected: No token');
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
            socket.data.user = decoded;
            next();
        } catch (err: any) {
            console.log('❌ Socket connection rejected:', err.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user.userId;
        console.log(`✅ User connected to socket: ${userId}`);

        // Join a room with the user's ID to receive private messages
        socket.join(userId);

        // Handle sending a message
        socket.on('send_message', async (data) => {
            const { receiverId, listingId, content } = data;

            if (receiverId === userId) {
                socket.emit('message_error', { error: 'Cannot send message to yourself' });
                return;
            }
            try {
                // Save message to database
                const newMessage = await prisma.message.create({
                    data: {
                        senderId: userId,
                        receiverId,
                        listingId,
                        message: content,
                        read: false,
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, avatarUrl: true }
                        },
                        receiver: {
                            select: { id: true, name: true, avatarUrl: true }
                        },
                        listing: {
                            select: { id: true, make: true, model: true }
                        }
                    }
                });

                // Emit to both rooms (sender and receiver) to keep devices in sync
                io.to(receiverId).to(userId).emit('receive_message', newMessage);

            } catch (error) {
                console.error('Socket message error:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected from socket: ${userId}`);
        });
    });

    return io;
};
