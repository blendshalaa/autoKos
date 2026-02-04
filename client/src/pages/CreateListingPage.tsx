import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import type { Listing, ApiResponse } from '../types/definitions';

interface CreateListingFormData {
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType: string;
    color: string;
    location: string;
    description: string;
}

const MAKES = ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Ford', 'Opel', 'Skoda', 'Peugeot', 'Renault'];
const FUELS = ['Diesel', 'Petrol', 'Hybrid', 'Electric', 'LPG'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck'];
const CITIES = ['Prishtina', 'Prizren', 'Peja', 'Gjakova', 'Ferizaj', 'Gjilan', 'Mitrovica'];

export const CreateListingPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateListingFormData>();
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

            if (validFiles.length + images.length > 10) {
                toast.error('Mund të ngarkoni maksimumi 10 foto.');
                return;
            }

            setImages(prev => [...prev, ...validFiles]);

            // Create previews
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // Revoke the URL to avoid memory leaks
            URL.revokeObjectURL(prev[index]);
            return newPreviews;
        });
    };

    const onSubmit = async (data: CreateListingFormData) => {
        setIsLoading(true);
        try {
            // 1. Create Listings
            const listingRes = await api.post<ApiResponse<{ listing: Listing }>>('/listings', data);
            const listingId = listingRes.data.data.listing.id;

            // 2. Upload Images if any
            if (images.length > 0) {
                const formData = new FormData();
                images.forEach(image => {
                    formData.append('images', image);
                });

                await api.post(`/listings/${listingId}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            toast.success('Shpallja u krijua me sukses!');
            navigate(`/listings/${listingId}`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Dështoi krijimi i shpalljes.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container-narrow py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
                        Shto Makinë të Re
                    </h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Make */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Marka</label>
                                <select
                                    {...register('make', { required: 'Marka është e detyrueshme' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                >
                                    <option value="">Zgjedh markën</option>
                                    {MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                                </select>
                                {errors.make && <span className="text-xs text-red-500">{errors.make.message}</span>}
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Modeli</label>
                                <input
                                    type="text"
                                    {...register('model', { required: 'Modeli është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.model && <span className="text-xs text-red-500">{errors.model.message}</span>}
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Viti</label>
                                <select
                                    {...register('year', { required: 'Viti është i detyrueshëm', valueAsNumber: true })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                >
                                    <option value="">Zgjedh vitin</option>
                                    {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {errors.year && <span className="text-xs text-red-500">{errors.year.message}</span>}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Çmimi (€)</label>
                                <input
                                    type="number"
                                    {...register('price', { required: 'Çmimi është i detyrueshëm', min: 1, valueAsNumber: true })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.price && <span className="text-xs text-red-500">{errors.price.message}</span>}
                            </div>

                            {/* Mileage */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kilometrazha (km)</label>
                                <input
                                    type="number"
                                    {...register('mileage', { required: 'Kilometrazha është e detyrueshme', min: 0, valueAsNumber: true })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.mileage && <span className="text-xs text-red-500">{errors.mileage.message}</span>}
                            </div>

                            {/* Fuel Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Karburanti</label>
                                <select
                                    {...register('fuelType', { required: 'Karburanti është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                >
                                    <option value="">Zgjedh karburantin</option>
                                    {FUELS.map(fuel => <option key={fuel} value={fuel}>{fuel}</option>)}
                                </select>
                                {errors.fuelType && <span className="text-xs text-red-500">{errors.fuelType.message}</span>}
                            </div>

                            {/* Transmission */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transmisioni</label>
                                <select
                                    {...register('transmission', { required: 'Transmisioni është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                >
                                    <option value="">Zgjedh transmisionin</option>
                                    {TRANSMISSIONS.map(trans => <option key={trans} value={trans}>{trans}</option>)}
                                </select>
                                {errors.transmission && <span className="text-xs text-red-500">{errors.transmission.message}</span>}
                            </div>

                            {/* Body Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Karroceria</label>
                                <select
                                    {...register('bodyType', { required: 'Karroceria është e detyrueshme' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                >
                                    <option value="">Zgjedh karrocerinë</option>
                                    {BODY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                                {errors.bodyType && <span className="text-xs text-red-500">{errors.bodyType.message}</span>}
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ngjyra</label>
                                <input
                                    type="text"
                                    {...register('color', { required: 'Ngjyra është e detyrueshme' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.color && <span className="text-xs text-red-500">{errors.color.message}</span>}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lokacioni</label>
                                <select
                                    {...register('location', { required: 'Lokacioni është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                >
                                    <option value="">Zgjedh qytetin</option>
                                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                                {errors.location && <span className="text-xs text-red-500">{errors.location.message}</span>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Përshkrimi</label>
                            <textarea
                                {...register('description', { required: 'Përshkrimi është i detyrueshëm', minLength: { value: 20, message: 'Minimum 20 karaktere' } })}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                            {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fotot (Max 10)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="relative group aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden h-24">
                                        <img src={src} alt="preview" className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 10 && (
                                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">Shto foto</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Button type="submit" size="lg" className="w-full sm:w-auto" isLoading={isLoading}>
                                Publiko Shpalljen
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};
