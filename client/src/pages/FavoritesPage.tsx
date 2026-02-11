import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import type { Listing, ApiResponse } from '../types/definitions';
import { ListingCard } from '../components/listings/ListingCard';
import { Layout } from '../components/layout/Layout';

export const FavoritesPage: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get<ApiResponse<{ listings: Listing[]; favoriteIds: string[] }>>('/favorites');
                setListings(response.data.data.listings);
                setFavoriteIds(response.data.data.favoriteIds);
            } catch (error) {
                console.error('Failed to fetch favorites', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleToggleFavorite = async (listingId: string) => {
        try {
            await api.post(`/favorites/${listingId}`);
            setListings(prev => prev.filter(l => l.id !== listingId));
            setFavoriteIds(prev => prev.filter(id => id !== listingId));
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    return (
        <Layout>
            <div className="container-narrow py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Të Ruajtura</h1>
                    <p className="mt-1 text-gray-500">Shpalljet që keni ruajtur</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg h-80"></div>
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                isFavorited={favoriteIds.includes(listing.id)}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nuk keni shpallje të ruajtura</h3>
                        <p className="mt-1 text-gray-500">Klikoni ikonën e zemrës për të ruajtur shpallje.</p>
                        <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                            Shfleto shpalljet
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};
