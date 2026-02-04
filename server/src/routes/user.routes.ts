import { Router } from 'express';
import { getUserById, updateProfile, uploadAvatar } from '../controllers/user.controller';
import { updateProfileValidation } from '../validators/user';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { avatarUpload } from '../middleware/upload';

const router = Router();

// GET /api/users/:id
router.get('/:id', getUserById);

// PUT /api/users/me
router.put('/me', authMiddleware, updateProfileValidation, validate, updateProfile);

// POST /api/users/me/avatar
router.post('/me/avatar', authMiddleware, avatarUpload, uploadAvatar);

export default router;
