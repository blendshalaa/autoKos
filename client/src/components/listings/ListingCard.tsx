import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, BoltIcon, ArrowTrendingDownIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import type { Listing } from "../../types/definitions";
import { formatPrice, formatNumber, getImageUrl } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface ListingCardProps {
    listing: Listing;
    isFavorited?: boolean;
    onToggleFavorite?: (listingId: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, isFavorited = false, onToggleFavorite }) => {
    const { user } = useAuthStore();
    const { addItem, removeItem, isInCompare, items } = useCompareStore();
    const inCompare = isInCompare(listing.id);

    const mainImage = listing.images && listing.images.length > 0
        ? listing.images.sort((a, b) => a.order - b.order)[0].thumbnailUrl
        : null;

    const statusBadge = listing.status && listing.status !== 'ACTIVE' ? (
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white z-10 ${listing.status === 'RESERVED' ? 'bg-amber-500' : 'bg-red-600'
            }`}>
            {listing.status === 'RESERVED' ? 'REZERVUAR' : 'SHITUR'}
        </div>
    ) : null;

    const priceDropBadge = listing.previousPrice && listing.previousPrice > listing.price ? (
        <div className={`absolute ${statusBadge ? 'top-10' : 'top-2'} left-2 px-2 py-1 rounded text-xs font-bold text-white bg-green-600 z-10 flex items-center shadow-sm`}>
            <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
            Çmimi u ul!
        </div>
    ) : null;

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Ju lutem hyni në llogari për të ruajtur shpallje');
            return;
        }
        if (onToggleFavorite) {
            onToggleFavorite(listing.id);
        } else {
            try {
                await api.post(`/favorites/${listing.id}`);
                toast.success(isFavorited ? 'U hoq nga të ruajturat' : 'U ruajt me sukses');
            } catch (error) {
                toast.error('Dështoi ruajtja');
            }
        }
    };

    const handleCompareClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inCompare) {
            removeItem(listing.id);
            toast.success('U hoq nga krahasimi');
        } else {
            if (items.length >= 3) {
                toast.error('Mund të krahasoni maksimum 3 vetura');
                return;
            }
            addItem(listing);
            toast.success('U shtua për krahasim');
        }
    };

    return (
        <Link to={`/listings/${listing.id}`} className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 relative">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                {mainImage ? (
                    <img
                        src={getImageUrl(mainImage)}
                        alt={`${listing.make} ${listing.model}`}
                        className="w-full h-48 object-cover group-hover:opacity-95 transition-opacity"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                        Pa foto
                    </div>
                )}
                {statusBadge}
                {priceDropBadge}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {listing.year}
                </div>

                {/* Action Buttons Container */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {user && (
                        <button
                            onClick={handleFavoriteClick}
                            className="p-1.5 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all shadow-sm flex items-center justify-center"
                            title={isFavorited ? 'Hiq nga të ruajturat' : 'Ruaj shpalljen'}
                        >
                            {isFavorited ? (
                                <HeartSolid className="h-5 w-5 text-red-500" />
                            ) : (
                                <HeartOutline className="h-5 w-5 text-gray-600 hover:text-red-400" />
                            )}
                        </button>
                    )}
                    <button
                        onClick={handleCompareClick}
                        className={`p-1.5 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all shadow-sm flex items-center justify-center ${inCompare ? 'text-blue-600' : 'text-gray-600'}`}
                        title={inCompare ? 'Hiq nga krahasimi' : 'Shto për krahasim'}
                    >
                        <ArrowPathRoundedSquareIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {listing.make} {listing.model}
                </h3>

                <div className="mt-1 flex items-baseline justify-between">
                    <p className="text-xl font-bold text-blue-600">
                        {formatPrice(listing.price)}
                    </p>
                    {listing.previousPrice && (
                        <p className="text-sm text-gray-400 line-through">
                            {formatPrice(listing.previousPrice)}
                        </p>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="truncate max-w-[100px]">{listing.location}</span>
                    </div>
                    <div className="flex items-center">
                        <BoltIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{listing.fuelType}</span>
                    </div>
                </div>

                <div className="mt-2 text-xs text-gray-400 border-t pt-2 flex justify-between">
                    <span>{formatNumber(listing.mileage)} km</span>
                    <span>{listing.transmission}</span>
                </div>
            </div>
        </Link>
    );
};
