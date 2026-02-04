import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, BoltIcon } from '@heroicons/react/24/outline';
import type { Listing } from "../../types/definitions";
import { formatPrice, formatNumber, getImageUrl } from '../../utils/format';

interface ListingCardProps {
    listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    const mainImage = listing.images && listing.images.length > 0
        ? listing.images.sort((a, b) => a.order - b.order)[0].thumbnailUrl
        : null;

    return (
        <Link to={`/listings/${listing.id}`} className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
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
                        No Image
                    </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {listing.year}
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
