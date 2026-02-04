import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import type { Listing, PaginatedResponse, ApiResponse } from '../types/definitions';
import { ListingCard } from '../components/listings/ListingCard';
import { Button } from '../components/common/Button';
import { Layout } from '../components/layout/Layout';

const MAKES = ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Ford', 'Opel', 'Skoda', 'Peugeot', 'Renault'];
const FUELS = ['Diesel', 'Petrol', 'Hybrid', 'Electric', 'LPG'];
const CITIES = ['Prishtina', 'Prizren', 'Peja', 'Gjakova', 'Ferizaj', 'Gjilan', 'Mitrovica'];

export const HomePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        make: searchParams.get('make') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minYear: searchParams.get('minYear') || '',
        maxYear: searchParams.get('maxYear') || '',
        fuelType: searchParams.get('fuelType') || '',
        location: searchParams.get('location') || '',
        search: searchParams.get('search') || '',
    });

    const fetchListings = async () => {
        setLoading(true);
        try {
            // Build query string from filters
            const params: Record<string, string> = { page: '1', limit: '20', sortBy: 'newest' };
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params[key] = value;
            });

            const response = await api.get<ApiResponse<PaginatedResponse<Listing>>>('/listings', { params });
            setListings(response.data.data.items);
            setTotal(response.data.data.total);
        } catch (error) {
            console.error('Failed to fetch listings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [searchParams]); // Re-fetch when URL params change

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Update URL params
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        setSearchParams(params);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Layout>
            <div className="bg-blue-600 pb-24 pt-12">
                <div className="container-narrow text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl lg:text-6xl">
                        Gjeni makinën tuaj të ëndrrave
                    </h1>
                    <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
                        Tregu më i madh dhe më i besueshëm për shitblerjen e automjeteve në Kosovë.
                    </p>
                </div>
            </div>

            <div className="container-narrow -mt-16">
                <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="col-span-1 md:col-span-4 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kërko</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="fjalë kyçe..."
                                    value={filters.search}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 h-10 border px-3"
                                />
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                            <select
                                name="make"
                                value={filters.make}
                                onChange={handleInputChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Të gjitha</option>
                                {MAKES.map(make => (
                                    <option key={make} value={make}>{make}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Karburanti</label>
                            <select
                                name="fuelType"
                                value={filters.fuelType}
                                onChange={handleInputChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Të gjitha</option>
                                {FUELS.map(fuel => (
                                    <option key={fuel} value={fuel}>{fuel}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qyteti</label>
                            <select
                                name="location"
                                value={filters.location}
                                onChange={handleInputChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Të gjitha</option>
                                {CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi Min</label>
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="€"
                                    value={filters.minPrice}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="€"
                                    value={filters.maxPrice}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Viti Min</label>
                                <select
                                    name="minYear"
                                    value={filters.minYear}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                >
                                    <option value="">Më i vjetër</option>
                                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                                <select
                                    name="maxYear"
                                    value={filters.maxYear}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                >
                                    <option value="">Më i ri</option>
                                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-4 flex items-end">
                            <Button type="submit" className="w-full h-10 mt-1">
                                Kërko
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Shpalljet e fundit <span className="text-gray-500 text-lg font-normal">({total})</span>
                    </h2>
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Rendit sipas: Më të rejat</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg h-80"></div>
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Nuk u gjetën rezultate</h3>
                        <p className="mt-1 text-gray-500">Provoni të ndryshoni filtrat e kërkimit.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};
