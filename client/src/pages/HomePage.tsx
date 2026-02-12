import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import type { Listing, PaginatedResponse, ApiResponse } from '../types/definitions';
import { ListingCard } from '../components/listings/ListingCard';
import { Button } from '../components/common/Button';
import { Layout } from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';

const MAKES = ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Ford', 'Opel', 'Skoda', 'Peugeot', 'Renault'];
const FUELS = ['Diesel', 'Petrol', 'Hybrid', 'Electric', 'LPG'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck'];
const CITIES = ['Prishtina', 'Prizren', 'Peja', 'Gjakova', 'Ferizaj', 'Gjilan', 'Mitrovica'];

export const HomePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    const [listings, setListings] = useState<Listing[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Initial filters state derived from URL
    const initialFilters = {
        make: searchParams.get('make') || '',
        model: searchParams.get('model') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minYear: searchParams.get('minYear') || '',
        maxYear: searchParams.get('maxYear') || '',
        fuelType: searchParams.get('fuelType') || '',
        transmission: searchParams.get('transmission') || '',
        bodyType: searchParams.get('bodyType') || '',
        location: searchParams.get('location') || '',
        search: searchParams.get('search') || '',
        sortBy: (searchParams.get('sortBy') as any) || 'newest',
        page: parseInt(searchParams.get('page') || '1'),
    };

    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle

    const fetchListings = async () => {
        setLoading(true);
        try {
            // Build query params
            const params: Record<string, string> = { limit: '12' };
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params[key] = String(value);
            });

            const response = await api.get<ApiResponse<PaginatedResponse<Listing>>>('/listings', { params });
            setListings(response.data.data.items);
            setTotal(response.data.data.total);
            setTotalPages(response.data.data.totalPages);

            // Fetch favorites if logged in
            if (isAuthenticated) {
                try {
                    const favRes = await api.get<ApiResponse<{ favoriteIds: string[] }>>('/favorites/ids');
                    setFavoriteIds(favRes.data.data.favoriteIds);
                } catch (error) {
                    console.error('Failed to fetch favorites', error);
                    // Don't fail the whole request, just don't show favorites
                }
            }
        } catch (error) {
            console.error('Failed to fetch listings', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
        window.scrollTo(0, 0);
    }, [searchParams, isAuthenticated]); // Refetch when URL params change

    // Update URL when filters change (debounced or on submit? classic is submit)
    // Actually, let's sync state -> URL on submit to avoid too many refreshes, 
    // EXCEPT for pagination and sort which should be instant.

    const applyFilters = (newFilters: typeof filters) => {
        const params: Record<string, string> = {};
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params[key] = String(value);
        });
        setSearchParams(params);
        setFilters(newFilters);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ ...filters, page: 1 }); // Reset to page 1 on filter change
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        const newFilters = { ...filters, sortBy: newSort, page: 1 };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        const params: Record<string, string> = {};
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params[key] = String(value);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        const cleared = {
            make: '', model: '', minPrice: '', maxPrice: '', minYear: '', maxYear: '',
            fuelType: '', transmission: '', bodyType: '', location: '', search: '',
            sortBy: 'newest', page: 1
        };
        setFilters(cleared as any);
        setSearchParams({});
    };

    const handleToggleFavorite = async (listingId: string) => {
        try {
            await api.post(`/favorites/${listingId}`);
            setFavoriteIds(prev =>
                prev.includes(listingId)
                    ? prev.filter(id => id !== listingId)
                    : [...prev, listingId]
            );
        } catch (error) {
            console.error(error);
        }
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
                    {/* Search Bar */}
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Kërko (p.sh. Golf 7, Audi A3, Dizel...)"
                                    value={filters.search}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 h-12 border px-3"
                                />
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                            <Button type="submit" size="lg" className="md:w-32 h-12">
                                Kërko
                            </Button>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden flex items-center justify-center h-12 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                Filtrat
                            </button>
                        </div>

                        {/* Filters Grid */}
                        <div className={`${showFilters ? 'block' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>

                            {/* Row 1: Basics */}
                            <select
                                name="make"
                                value={filters.make}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Të gjitha Markat</option>
                                {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>

                            <select
                                name="location"
                                value={filters.location}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Të gjitha Qytetet</option>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <select
                                name="minYear"
                                value={filters.minYear}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Viti (Min)</option>
                                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            <select
                                name="maxYear"
                                value={filters.maxYear}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Viti (Max)</option>
                                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            {/* Row 2: Details */}
                            <select
                                name="fuelType"
                                value={filters.fuelType}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Karburanti</option>
                                {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>

                            <select
                                name="transmission"
                                value={filters.transmission}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Transmisioni</option>
                                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            <select
                                name="bodyType"
                                value={filters.bodyType}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                            >
                                <option value="">Karroceria</option>
                                {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>

                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="Çmimi Min"
                                    value={filters.minPrice}
                                    onChange={handleInputChange}
                                    className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={handleInputChange}
                                    className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                />
                            </div>

                            <div className="md:col-span-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Pastro të gjitha filtrat
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Results Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Rezultatet <span className="text-gray-500 text-lg font-normal">({total} shpallje)</span>
                    </h2>
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-500 whitespace-nowrap">Rendit sipas:</span>
                        <select
                            value={filters.sortBy}
                            onChange={handleSortChange}
                            className="text-sm border-none focus:ring-0 text-gray-700 font-medium bg-transparent cursor-pointer"
                        >
                            <option value="newest">Më të rejat</option>
                            <option value="price_asc">Çmimi (të ulëta)</option>
                            <option value="price_desc">Çmimi (të larta)</option>
                            <option value="views">Më të shikuarat</option>
                        </select>
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg h-80"></div>
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center space-x-4">
                                <button
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page === 1}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                                </button>
                                <span className="text-gray-700 font-medium">
                                    Faqja {filters.page} nga {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page === totalPages}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nuk u gjetën rezultate</h3>
                        <p className="mt-1 text-gray-500">Provoni të hiqni disa filtra ose kërkoni diçka tjetër.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Pastro filtrat
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};
