import { Router } from 'express';
import {
    sendMessage,
    getConversations,
    getConversation,
    markAsRead,
    getUnreadCount,
} from '../controllers/message.controller';
import { sendMessageValidation } from '../validators/message';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/messages
router.post('/', authMiddleware, sendMessageValidation, validate, sendMessage);

// GET /api/conversations
router.get('/conversations', authMiddleware, getConversations);

// GET /api/conversations/:userId
router.get('/conversations/:userId', authMiddleware, getConversation);

// PATCH /api/messages/:id/read
router.patch('/:id/read', authMiddleware, markAsRead);

// GET /api/messages/unread-count
router.get('/unread-count', authMiddleware, getUnreadCount);

export default router;
