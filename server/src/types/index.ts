import { Request } from 'express';
import { User } from '@prisma/client';

// Extended Request with authenticated user
export interface AuthRequest extends Request {
    user?: User;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// Pagination
export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Listing filters
export interface ListingFilters {
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    make?: string;
    fuelType?: string;
    transmission?: string;
    location?: string;
    search?: string;
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'views';
}

// User without password
export type SafeUser = Omit<User, 'password'>;

// JWT Payload
export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Conversation summary for messaging
export interface ConversationSummary {
    userId: string;
    userName: string;
    userAvatar: string | null;
    lastMessage: string;
    lastMessageDate: Date;
    unreadCount: number;
}
