import { Response } from 'express';
import { AuthRequest, ListingFilters } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { processImage, deleteImage } from '../utils/image';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const {
            make, model, year, price, mileage,
            fuelType, transmission, bodyType, color, location, description,
        } = req.body;

        // Check for listing limits (New User < 30 days => Max 3 listings)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (req.user.createdAt > thirtyDaysAgo) {
            const count = await prisma.listing.count({
                where: { userId: req.user.id }
            });

            if (count >= 3) {
                sendError(res, 'New accounts (less than 30 days old) are limited to 3 listings to prevent spam.', 403);
                return;
            }
        }

        const listing = await prisma.listing.create({
            data: {
                userId: req.user.id,
                make,
                model,
                year: parseInt(year),
                price: parseInt(price),
                mileage: parseInt(mileage),
                fuelType,
                transmission,
                bodyType,
                color,
                location,
                description,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        bio: true // Include bio for listing card/details
                    },
                },
                images: true,
            },
        });

        sendSuccess(res, { listing }, 201);
    } catch (error) {
        console.error('CreateListing error:', error);
        sendError(res, 'Failed to create listing', 500);
    }
};

export const getListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const skip = (page - 1) * limit;

        const filters: ListingFilters = {
            minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
            minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
            maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
            make: req.query.make as string,
            fuelType: req.query.fuelType as string,
            transmission: req.query.transmission as string,
            location: req.query.location as string,
            search: req.query.search as string,
            sortBy: req.query.sortBy as ListingFilters['sortBy'],
        };

        // Build where clause
        const where: Prisma.ListingWhereInput = {
            isSold: false,
        };

        if (filters.minPrice || filters.maxPrice) {
            where.price = {
                ...(filters.minPrice && { gte: filters.minPrice }),
                ...(filters.maxPrice && { lte: filters.maxPrice }),
            };
        }

        if (filters.minYear || filters.maxYear) {
            where.year = {
                ...(filters.minYear && { gte: filters.minYear }),
                ...(filters.maxYear && { lte: filters.maxYear }),
            };
        }

        if (filters.make) {
            where.make = { equals: filters.make, mode: 'insensitive' };
        }

        if (filters.fuelType) {
            where.fuelType = filters.fuelType;
        }

        if (filters.transmission) {
            where.transmission = filters.transmission;
        }

        if (filters.location) {
            where.location = { contains: filters.location, mode: 'insensitive' };
        }

        if (filters.search) {
            where.OR = [
                { make: { contains: filters.search, mode: 'insensitive' } },
                { model: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        // Build orderBy
        let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };

        switch (filters.sortBy) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'views':
                orderBy = { views: 'desc' };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
        }

        // Get listings and total count
        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                            bio: true
                        },
                    },
                    images: {
                        take: 1,
                        orderBy: { order: 'asc' },
                    },
                },
            }),
            prisma.listing.count({ where }),
        ]);

        sendPaginated(res, listings, total, page, limit);
    } catch (error) {
        console.error('GetListings error:', error);
        sendError(res, 'Failed to get listings', 500);
    }
};

export const getListingById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        location: true,
                        avatarUrl: true,
                        createdAt: true,
                        bio: true
                    },
                },
                images: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!listing) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        // Increment views (don't await to speed up response)
        prisma.listing.update({
            where: { id },
            data: { views: { increment: 1 } },
        }).catch(() => { }); // Ignore errors

        sendSuccess(res, { listing });
    } catch (error) {
        console.error('GetListingById error:', error);
        sendError(res, 'Failed to get listing', 500);
    }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            make, model, year, price, mileage,
            fuelType, transmission, bodyType, color, location, description, isSold,
        } = req.body;

        const listing = await prisma.listing.update({
            where: { id },
            data: {
                ...(make && { make }),
                ...(model && { model }),
                ...(year && { year: parseInt(year) }),
                ...(price && { price: parseInt(price) }),
                ...(mileage !== undefined && { mileage: parseInt(mileage) }),
                ...(fuelType && { fuelType }),
                ...(transmission && { transmission }),
                ...(bodyType && { bodyType }),
                ...(color && { color }),
                ...(location && { location }),
                ...(description && { description }),
                ...(isSold !== undefined && { isSold }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                images: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        sendSuccess(res, { listing });
    } catch (error) {
        console.error('UpdateListing error:', error);
        sendError(res, 'Failed to update listing', 500);
    }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get listing images to delete
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: { images: true },
        });

        if (!listing) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        // Delete listing (images will cascade delete in DB)
        await prisma.listing.delete({ where: { id } });

        // Delete image files
        for (const image of listing.images) {
            await deleteImage(image.imageUrl);
            await deleteImage(image.thumbnailUrl);
        }

        sendSuccess(res, { message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('DeleteListing error:', error);
        sendError(res, 'Failed to delete listing', 500);
    }
};

export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            sendError(res, 'No images provided', 400);
            return;
        }

        // Check current image count
        const currentImageCount = await prisma.listingImage.count({
            where: { listingId: id },
        });

        if (currentImageCount + files.length > 10) {
            sendError(res, `Cannot upload more than 10 images. Current: ${currentImageCount}`, 400);
            return;
        }

        // Process and save images
        const images = await Promise.all(
            files.map(async (file, index) => {
                const { imageUrl, thumbnailUrl } = await processImage(file, `listings/${id}`);

                return prisma.listingImage.create({
                    data: {
                        listingId: id,
                        imageUrl,
                        thumbnailUrl,
                        order: currentImageCount + index,
                    },
                });
            })
        );

        sendSuccess(res, { images }, 201);
    } catch (error) {
        console.error('UploadImages error:', error);
        sendError(res, 'Failed to upload images', 500);
    }
};

export const deleteImageFromListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, imageId } = req.params;

        const image = await prisma.listingImage.findFirst({
            where: {
                id: imageId,
                listingId: id,
            },
        });

        if (!image) {
            sendError(res, 'Image not found', 404);
            return;
        }

        // Delete from database
        await prisma.listingImage.delete({ where: { id: imageId } });

        // Delete files
        await deleteImage(image.imageUrl);
        await deleteImage(image.thumbnailUrl);

        sendSuccess(res, { message: 'Image deleted successfully' });
    } catch (error) {
        console.error('DeleteImage error:', error);
        sendError(res, 'Failed to delete image', 500);
    }
};
