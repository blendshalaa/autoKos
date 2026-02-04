export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    error?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    location?: string | null;
    phone?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    createdAt: string;
}

export interface ListingImage {
    id: string;
    listingId: string;
    imageUrl: string;
    thumbnailUrl: string;
    order: number;
}

export interface Listing {
    id: string;
    userId: string;
    user?: User; // included on some endpoints
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType: string;
    color: string;
    location: string;
    description: string;
    isSold: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
    images: ListingImage[];
}

export interface Message {
    id: string;
    listingId: string;
    senderId: string;
    receiverId: string;
    message: string;
    read: boolean;
    createdAt: string;
    sender?: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    receiver?: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    listing?: {
        id: string;
        make: string;
        model: string;
        images?: ListingImage[];
    };
}

export interface ConversationSummary {
    userId: string;
    userName: string;
    userAvatar: string | null;
    lastMessage: string;
    lastMessageDate: string;
    unreadCount: number;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ListingFilters {
    page?: number;
    limit?: number;
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

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
