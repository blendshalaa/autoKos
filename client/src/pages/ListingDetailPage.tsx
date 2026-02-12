import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    CalendarIcon,
    BoltIcon,
    CogIcon,
    UserCircleIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    FlagIcon,
    CheckBadgeIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowPathIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import type { Listing, User, ApiResponse } from '../types/definitions';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { formatPrice, formatNumber, getImageUrl } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import { useRecentlyViewedStore } from '../store/recentlyViewedStore';
import { SimilarListings } from '../components/listings/SimilarListings';
import { RecentlyViewed } from '../components/listings/RecentlyViewed';

export const ListingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const handleNextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!listing?.images || listing.images.length === 0) return;
        const sorted = [...listing.images].sort((a, b) => a.order - b.order);
        const currentIndex = sorted.findIndex(img => img.imageUrl === activeImage);
        const nextIndex = (currentIndex + 1) % sorted.length;
        setActiveImage(sorted[nextIndex].imageUrl);
    };

    const handlePrevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!listing?.images || listing.images.length === 0) return;
        const sorted = [...listing.images].sort((a, b) => a.order - b.order);
        const currentIndex = sorted.findIndex(img => img.imageUrl === activeImage);
        const prevIndex = (currentIndex - 1 + sorted.length) % sorted.length;
        setActiveImage(sorted[prevIndex].imageUrl);
    };

    const { addId } = useRecentlyViewedStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') handleNextImage();
            if (e.key === 'ArrowLeft') handlePrevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, activeImage, listing]);

    useEffect(() => {
        if (id) {
            addId(id);
        }
    }, [id, addId]);

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
                navigate('/');
            } catch (error) {
                console.error('Failed to delete listing', error);
                toast.error('Dështoi fshirja e shpalljes.');
            }
        }
    };

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/listings/${id}/report`, { reason: reportReason });
            toast.success('Raportimi u dërgua me sukses! Faleminderit.');
            setIsReportModalOpen(false);
            setReportReason('');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Dështoi raportimi.');
        }
    };
    const handleMessageSeller = () => {
        if (!user) {
            toast.error('Ju lutem hyni në llogari për të dërguar mesazh');
            navigate('/login');
            return;
        }
        navigate('/messages', {
            state: {
                recipientId: listing.userId,
                listingId: listing.id,
                recipient: listing.user
            }
        });
    };

    const isNewSeller = listing.user?.createdAt
        ? (new Date().getTime() - new Date(listing.user.createdAt).getTime()) < (30 * 24 * 60 * 60 * 1000)
        : false;

    return (
        <Layout>
            <div className="container-narrow py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div
                                className="bg-gray-100 h-96 flex items-center justify-center cursor-zoom-in relative group"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                {activeImage ? (
                                    <>
                                        <img
                                            src={getImageUrl(activeImage)}
                                            alt={listing.make}
                                            className="object-contain w-full h-full"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                                Kliko për të zmadhuar
                                            </span>
                                        </div>
                                    </>
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveImage(img.imageUrl);
                                                }}
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
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{listing.description}</p>
                        </div>
                    </div>

                    {/* Right Column: Key Info & Seller */}
                    <div className="space-y-6">
                        {/* Main Info Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h1 className="text-2xl font-bold text-gray-900">{listing.make} {listing.model}</h1>
                            <div className="mt-2 text-3xl font-bold text-blue-600">{formatPrice(listing.price)}</div>

                            {/* Status Badge */}
                            {listing.status !== 'ACTIVE' && (
                                <div className={`inline-block px-3 py-1 rounded-md text-sm font-bold mt-2 ${listing.status === 'SOLD' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {listing.status === 'SOLD' ? 'E SHITUR' : 'E REZERVUAR'}
                                </div>
                            )}

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
                                    {isNewSeller && (
                                        <div className="mt-1 flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                                            <CheckBadgeIcon className="h-3 w-3 mr-1" />
                                            Shitës i Ri
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expiry Warning for Owner */}
                            {isOwner && listing.expiresAt && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                                    <div className="flex items-center text-blue-800 font-medium mb-1">
                                        <ClockIcon className="h-5 w-5 mr-2" />
                                        Skadon më: {new Date(listing.expiresAt).toLocaleDateString()}
                                    </div>
                                    {new Date(listing.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                                        <p className="text-sm text-blue-600 mb-2">
                                            Shpallja juaj po skadon. Rinovoni tani për ta mbajtur aktive.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {!isOwner ? (
                                <>
                                    {/* Admin Actions */}
                                    {user?.role === 'ADMIN' && (
                                        <div className="mb-4 pt-4 border-t">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Admin Actions</p>
                                            <Button
                                                variant="danger"
                                                className="w-full mb-2"
                                                onClick={handleDelete}
                                            >
                                                Fshi (Admin)
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full flex items-center justify-center"
                                        onClick={handleMessageSeller}
                                    >
                                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                                        Mesazho Shitësin
                                    </Button>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="mt-3 flex items-center justify-center w-full text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <FlagIcon className="h-3 w-3 mr-1" />
                                        Raporto Shpalljen
                                    </button>
                                </>
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

                                    {/* Renew Button */}
                                    <Button
                                        className="col-span-2 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                                        onClick={async () => {
                                            if (confirm('Dëshironi të rinovoni shpalljen për 30 ditë?')) {
                                                try {
                                                    await api.post(`/listings/${id}/renew`);
                                                    toast.success('Shpallja u rinovua me sukses!');
                                                    window.location.reload();
                                                } catch (error) {
                                                    toast.error('Dështoi rinovimi');
                                                }
                                            }
                                        }}
                                    >
                                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                                        Rinovo Shpalljen
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center backdrop-blur-sm">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[110]"
                    >
                        <XMarkIcon className="h-8 w-8" />
                    </button>
                    <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-[110] bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full"
                    >
                        <ChevronLeftIcon className="h-8 w-8" />
                    </button>
                    <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-[110] bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full"
                    >
                        <ChevronRightIcon className="h-8 w-8" />
                    </button>
                    <div className="w-full h-full p-4 flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
                        <img
                            src={getImageUrl(activeImage || '')}
                            alt="Full screen"
                            className="max-w-full max-h-full object-contain cursor-default relative z-[105]"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        {listing.images && (
                            `${listing.images.findIndex(img => img.imageUrl === activeImage) + 1} / ${listing.images.length}`
                        )}
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Raporto Shpalljen</h3>
                        <form onSubmit={handleReport}>
                            <textarea
                                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Pse po e raportoni këtë shpallje? (psh. Mashtrim, Përmbajtje e papërshtatshme)"
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                required
                            />
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsReportModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    Anulo
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Dërgo Raportin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Similar and Recent Listings */}
            <div className="container-narrow pb-12">
                <SimilarListings listingId={id!} />
                <RecentlyViewed />
            </div>
        </Layout>
    );
};
