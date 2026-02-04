import { Response } from 'express';
import { AuthRequest, ConversationSummary } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../config/database';

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const { listingId, receiverId, message } = req.body;

        // Verify listing exists
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        // Prevent sending message to self
        if (receiverId === req.user.id) {
            sendError(res, 'Cannot send message to yourself', 400);
            return;
        }

        // Verify receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
        });

        if (!receiver) {
            sendError(res, 'Receiver not found', 404);
            return;
        }

        const newMessage = await prisma.message.create({
            data: {
                listingId,
                senderId: req.user.id,
                receiverId,
                message,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                listing: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                    },
                },
            },
        });

        sendSuccess(res, { message: newMessage }, 201);
    } catch (error) {
        console.error('SendMessage error:', error);
        sendError(res, 'Failed to send message', 500);
    }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const userId = req.user.id;

        // Get all messages where user is sender or receiver
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        // Group by other user
        const conversationsMap = new Map<string, ConversationSummary>();

        for (const msg of messages) {
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
            const otherUserId = otherUser.id;

            if (!conversationsMap.has(otherUserId)) {
                // Count unread messages from this user
                const unreadCount = messages.filter(
                    m => m.senderId === otherUserId && m.receiverId === userId && !m.read
                ).length;

                conversationsMap.set(otherUserId, {
                    userId: otherUserId,
                    userName: otherUser.name,
                    userAvatar: otherUser.avatarUrl,
                    lastMessage: msg.message,
                    lastMessageDate: msg.createdAt,
                    unreadCount,
                });
            }
        }

        const conversations = Array.from(conversationsMap.values());

        sendSuccess(res, { conversations });
    } catch (error) {
        console.error('GetConversations error:', error);
        sendError(res, 'Failed to get conversations', 500);
    }
};

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const { userId: otherUserId } = req.params;
        const currentUserId = req.user.id;

        // Get messages between the two users
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: currentUserId },
                ],
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                listing: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                        images: {
                            take: 1,
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });

        // Mark messages from other user as read
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: currentUserId,
                read: false,
            },
            data: { read: true },
        });

        // Get other user info
        const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
            },
        });

        sendSuccess(res, { messages, otherUser });
    } catch (error) {
        console.error('GetConversation error:', error);
        sendError(res, 'Failed to get conversation', 500);
    }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const { id } = req.params;

        const message = await prisma.message.findUnique({
            where: { id },
        });

        if (!message) {
            sendError(res, 'Message not found', 404);
            return;
        }

        // Only receiver can mark as read
        if (message.receiverId !== req.user.id) {
            sendError(res, 'You can only mark your own messages as read', 403);
            return;
        }

        const updatedMessage = await prisma.message.update({
            where: { id },
            data: { read: true },
        });

        sendSuccess(res, { message: updatedMessage });
    } catch (error) {
        console.error('MarkAsRead error:', error);
        sendError(res, 'Failed to mark message as read', 500);
    }
};
