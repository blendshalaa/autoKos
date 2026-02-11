import { Router } from 'express';
import { toggleFavorite, getFavorites, getFavoriteIds } from '../controllers/favorite.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/favorites - get user's favorited listings
router.get('/', authMiddleware, getFavorites);

// GET /api/favorites/ids - get just the listing IDs (lightweight)
router.get('/ids', authMiddleware, getFavoriteIds);

// POST /api/favorites/:listingId - toggle favorite
router.post('/:listingId', authMiddleware, toggleFavorite);

export default router;
