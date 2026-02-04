import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    CalendarIcon,
    BoltIcon,
    CogIcon, // Transmission replacement
    TruckIcon, // BodyType replacement
    UserCircleIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import type { Listing, User, ApiResponse } from '../types/definitions';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { formatPrice, formatNumber, formatDate, getImageUrl } from '../utils/format';
import { useAuthStore } from '../store/authStore';

export const ListingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await api.get<ApiResponse<{ listing: Listing & { user: User } }>>(`/listings/${id}`);
                setListing(response.data.data.listing);
                if (response.data.data.listing.images && response.data.data.listing.images.length > 0) {
                    // Sort by order and set first as active
                    const sortedImages = response.data.data.listing.images.sort((a, b) => a.order - b.order);
                    setActiveImage(sortedImages[0].imageUrl);
                }
            } catch (error) {
                console.error('Failed to fetch listing', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="container-narrow py-12 animate-pulse">
                    <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </Layout>
        );
    }

    if (!listing) {
        return (
            <Layout>
                <div className="container-narrow py-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Shpallja nuk u gjet</h2>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        Kthehu në ballinë
                    </Link>
                </div>
            </Layout>
        );
    }

    const isOwner = user?.id === listing.userId;

    const handleDelete = async () => {
        if (window.confirm('A jeni i sigurt që dëshironi ta fshini këtë shpallje?')) {
            try {
                await api.delete(`/listings/${id}`);
                toast.success('Shpallja u fshi me sukses!');
                navigate('/'); // Or to profile
            } catch (error) {
                console.error('Failed to delete listing', error);
                toast.error('Dështoi fshirja e shpalljes.');
            }
        }
    };

    return (
        <Layout>
            <div className="container-narrow py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                            <div className="aspect-w-16 aspect-h-10 bg-gray-100 h-96 flex items-center justify-center">
                                {activeImage ? (
                                    <img
                                        src={getImageUrl(activeImage)}
                                        alt={listing.make}
                                        className="object-contain w-full h-full"
                                    />
                                ) : (
                                    <div className="text-gray-400">No Image Available</div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {listing.images && listing.images.length > 1 && (
                                <div className="flex space-x-2 p-4 overflow-x-auto">
                                    {listing.images
                                        .sort((a, b) => a.order - b.order)
                                        .map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => setActiveImage(img.imageUrl)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${activeImage === img.imageUrl ? 'border-blue-600' : 'border-transparent'
                                                    }`}
                                            >
                                                <img
                                                    src={getImageUrl(img.thumbnailUrl)}
                                                    alt="thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Përshkrimi</h3>
                            <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                        </div>
                    </div>

                    {/* Right Column: Key Info & Seller */}
                    <div className="space-y-6">

                        {/* Main Info Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h1 className="text-2xl font-bold text-gray-900">{listing.make} {listing.model}</h1>
                            <div className="mt-2 text-3xl font-bold text-blue-600">{formatPrice(listing.price)}</div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center text-gray-600">
                                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>Viti {listing.year}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <CogIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>{formatNumber(listing.mileage)} km</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <BoltIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>{listing.fuelType}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <CogIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>{listing.transmission}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>{listing.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-sm font-uppercase text-gray-500 font-bold mb-4 tracking-wider">SHITËSI</h3>
                            <div className="flex items-center mb-6">
                                <div className="flex-shrink-0">
                                    {listing.user?.avatarUrl ? (
                                        <img
                                            src={getImageUrl(listing.user.avatarUrl)}
                                            alt={listing.user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-12 w-12 text-gray-300" />
                                    )}
                                </div>
                                <div className="ml-3">
                                    <Link to={`/profile/${listing.userId}`} className="text-base font-medium text-gray-900 hover:text-blue-600">
                                        {listing.user?.name || 'User'}
                                    </Link>
                                    <div className="text-sm text-gray-500">
                                        {listing.user?.location || listing.location}
                                    </div>
                                </div>
                            </div>

                            {listing.user?.phone && (
                                <div className="flex items-center mb-4 text-gray-700 font-medium">
                                    <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    {listing.user.phone}
                                </div>
                            )}

                            {!isOwner ? (
                                <Button className="w-full flex items-center justify-center">
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                                    Mesazho Shitësin
                                </Button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/listings/${id}/edit`)}
                                    >
                                        Modifiko
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="w-full"
                                        onClick={handleDelete}
                                    >
                                        Fshi
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};
