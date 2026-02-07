import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserCircleIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import type { User, Listing, ApiResponse } from '../../types/definitions';
import { Layout } from '../../components/layout/Layout';
import { ListingCard } from '../../components/listings/ListingCard';
import { getImageUrl, formatDate } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';

export const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuthStore();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get<ApiResponse<{ user: User & { listings: Listing[] } }>>(`/users/${userId}`);
                const { listings: userListings, ...userData } = response.data.data.user;
                setProfileUser(userData);
                setListings(userListings || []); // Listing controller includes listings
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <Layout>
                <div className="container-narrow py-12 animate-pulse">
                    <div className="bg-white p-6 rounded-lg mb-8 h-40"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-200 h-60 rounded-lg"></div>
                        <div className="bg-gray-200 h-60 rounded-lg"></div>
                        <div className="bg-gray-200 h-60 rounded-lg"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!profileUser) return null;

    const isOwnProfile = currentUser?.id === profileUser.id;

    return (
        <Layout>
            <div className="bg-white shadow">
                <div className="container-narrow py-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="flex-shrink-0">
                            {profileUser.avatarUrl ? (
                                <img
                                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                                    src={getImageUrl(profileUser.avatarUrl)}
                                    alt={profileUser.name}
                                />
                            ) : (
                                <UserCircleIcon className="h-32 w-32 text-gray-300" />
                            )}
                        </div>

                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-3xl font-bold text-gray-900">{profileUser.name}</h1>
                            <div className="mt-2 flex flex-col md:flex-row items-center gap-4 text-gray-600">
                                {profileUser.location && (
                                    <div className="flex items-center">
                                        <MapPinIcon className="h-5 w-5 mr-1 text-gray-400" />
                                        <span>{profileUser.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-1 text-gray-400" />
                                    <span>Anëtar që nga {formatDate(profileUser.createdAt)}</span>
                                </div>
                            </div>

                            {profileUser.bio && (
                                <p className="mt-4 text-gray-600 max-w-2xl">{profileUser.bio}</p>
                            )}
                        </div>

                        <div className="flex-shrink-0">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => window.location.href = '/profile/edit'}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Modifiko Profilin
                                </button>
                            ) : (
                                <Button>Mesazho Përdoruesin</Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-narrow py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Shpalljet Aktive ({listings.length})
                </h2>

                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Ky përdorues nuk ka shpallje aktive.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};
