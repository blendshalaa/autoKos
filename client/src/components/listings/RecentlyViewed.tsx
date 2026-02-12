import React, { useEffect, useState } from 'react';
import { useRecentlyViewedStore } from '../../store/recentlyViewedStore';
import api from '../../services/api';
import type { Listing, ApiResponse } from '../../types/definitions';
import { ListingCard } from './ListingCard';

export const RecentlyViewed: React.FC = () => {
    const { ids } = useRecentlyViewedStore();
    const [listings, setListings] = useState<Listing[]>([]);

    useEffect(() => {
        const fetchListings = async () => {
            if (ids.length === 0) return;
            if (ids.length === 0) return;
            try {
                // Fetch listings by IDs
                // api.get supports params serialization? Usually axios does.
                // But my backend expects ?ids=id1,id2
                const response = await api.get<ApiResponse<{ items: Listing[] }>>(`/listings`, {
                    params: { ids: ids.join(',') }
                });

                // Sort by order in ids array if possible, or just display returned order
                // The backend returns them in DB order or whatever. 
                // Let's sort them on client to match "recently viewed" order (ids[0] is most recent)
                const fetched = response.data.data.items;
                const sorted = ids
                    .map(id => fetched.find(l => l.id === id))
                    .filter((l): l is Listing => !!l);

                setListings(sorted);
            } catch (error) {
                console.error('Failed to fetch recent listings', error);
            }
        };

        if (ids.length > 0) {
            fetchListings();
        }
    }, [ids]);

    if (listings.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Të shikuara së fundmi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.slice(0, 4).map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </div>
    );
};
