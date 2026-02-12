import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import {
    getDashboardStats,
    getReports,
    resolveReport,
    getUsers,
    toggleBanUser
} from '../controllers/admin.controller';

const router = Router();

// Protect all routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getDashboardStats);
router.get('/reports', getReports);
router.post('/reports/:id/resolve', resolveReport);
router.get('/users', getUsers);
router.post('/users/:id/ban', toggleBanUser);

export default router;
