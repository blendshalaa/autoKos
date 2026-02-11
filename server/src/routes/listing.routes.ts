import { Router } from 'express';
import {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
    uploadImages,
    deleteImageFromListing,
    reorderImages,
} from '../controllers/listing.controller';
import { reportListing } from '../controllers/report.controller';
import { createListingValidation, updateListingValidation } from '../validators/listing';
import { reportValidation } from '../validators/report';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { listingOwnerMiddleware } from '../middleware/owner';
import { listingImagesUpload } from '../middleware/upload';

const router = Router();

// POST /api/listings
router.post('/', authMiddleware, createListingValidation, validate, createListing);

// GET /api/listings
router.get('/', getListings);

// GET /api/listings/:id
router.get('/:id', getListingById);

// PUT /api/listings/:id
router.put(
    '/:id',
    authMiddleware,
    listingOwnerMiddleware,
    updateListingValidation,
    validate,
    updateListing
);

// DELETE /api/listings/:id
router.delete('/:id', authMiddleware, listingOwnerMiddleware, deleteListing);

// POST /api/listings/:id/images
router.post(
    '/:id/images',
    authMiddleware,
    listingOwnerMiddleware,
    listingImagesUpload,
    uploadImages
);

// DELETE /api/listings/:id/images/:imageId
router.delete(
    '/:id/images/:imageId',
    authMiddleware,
    listingOwnerMiddleware,
    deleteImageFromListing
);

// PUT /api/listings/:id/images/reorder
router.put(
    '/:id/images/reorder',
    authMiddleware,
    listingOwnerMiddleware,
    reorderImages
);

// POST /api/listings/:id/report
router.post('/:id/report', authMiddleware, reportValidation, validate, reportListing);

export default router;
