import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Listing, ApiResponse } from '../../types/definitions';
import { ListingCard } from './ListingCard';

interface SimilarListingsProps {
    listingId: string;
}

export const SimilarListings: React.FC<SimilarListingsProps> = ({ listingId }) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            setLoading(true);
            try {
                // This endpoint returns { listings: [...] } directly in data? No, standard ApiResponse wrapper.
                const response = await api.get<ApiResponse<{ listings: Listing[] }>>(`/listings/${listingId}/similar`);
                setListings(response.data.data.listings);
            } catch (error) {
                console.error('Failed to fetch similar listings', error);
            } finally {
                setLoading(false);
            }
        };

        if (listingId) {
            fetchSimilar();
        }
    }, [listingId]);

    if (!loading && listings.length === 0) return null;

    if (loading) {
        return (
            <div className="mt-12 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-100 h-80 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12 border-t pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shpallje të Ngjashme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </div>
    );
};
