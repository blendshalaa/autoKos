import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import type { Listing, ApiResponse } from '../types/definitions';
import { getImageUrl } from '../utils/format';

interface EditListingFormData {
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
    status: 'ACTIVE' | 'RESERVED' | 'SOLD';
    description: string;
}

const MAKES = ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Ford', 'Opel', 'Skoda', 'Peugeot', 'Renault'];
const FUELS = ['Diesel', 'Petrol', 'Hybrid', 'Electric', 'LPG'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck'];
const CITIES = ['Prishtina', 'Prizren', 'Peja', 'Gjakova', 'Ferizaj', 'Gjilan', 'Mitrovica'];
const STATUSES = [
    { value: 'ACTIVE', label: 'Aktive' },
    { value: 'RESERVED', label: 'E Rezervuar' },
    { value: 'SOLD', label: 'E Shitur' }
];

export const EditListingPage: React.FC = () => {
    // ... (existing hooks)
    const { id } = useParams<{ id: string }>();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditListingFormData>();
    const [images, setImages] = useState<File[]>([]); // New images
    const [existingImages, setExistingImages] = useState<Array<{ id: string, imageUrl: string, order: number }>>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [draggedExistingIndex, setDraggedExistingIndex] = useState<number | null>(null);
    const navigate = useNavigate();

    // ... (useEffect to fetch listing)
    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await api.get<ApiResponse<{ listing: Listing }>>(`/listings/${id}`);
                const listing = response.data.data.listing;

                // Pre-fill form
                setValue('make', listing.make);
                setValue('model', listing.model);
                setValue('year', listing.year);
                setValue('price', listing.price);
                setValue('mileage', listing.mileage);
                setValue('fuelType', listing.fuelType);
                setValue('transmission', listing.transmission);
                setValue('bodyType', listing.bodyType);
                setValue('color', listing.color);
                setValue('location', listing.location);
                setValue('status', listing.status);
                setValue('description', listing.description);

                if (listing.images) {
                    setExistingImages(listing.images.sort((a, b) => a.order - b.order));
                }
            } catch (error) {
                console.error('Failed to fetch listing', error);
                toast.error('Dështoi marrja e të dhënave të shpalljes.');
                navigate('/');
            } finally {
                setIsFetching(false);
            }
        };

        if (id) fetchListing();
    }, [id, setValue, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

            if (validFiles.length + images.length + existingImages.length > 10) {
                toast.error('Mund të keni maksimumi 10 foto gjithsej.');
                return;
            }

            setImages(prev => [...prev, ...validFiles]);

            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index]);
            return newPreviews;
        });
    };

    const removeExistingImage = async (imageId: string) => {
        if (!window.confirm('A jeni i sigurt që dëshironi ta fshini këtë foto?')) return;

        try {
            await api.delete(`/listings/${id}/images/${imageId}`);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
            toast.success('Foto u fshi.');
        } catch (error) {
            console.error('Failed to delete image', error);
            toast.error('Dështoi fshirja e fotos.');
        }
    };

    // ... (handleImageChange, removeNewImage, removeExistingImage)

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedExistingIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedExistingIndex === null || draggedExistingIndex === dropIndex) return;

        const newExistingImages = [...existingImages];
        const [movedImage] = newExistingImages.splice(draggedExistingIndex, 1);
        newExistingImages.splice(dropIndex, 0, movedImage);

        setExistingImages(newExistingImages);
        setDraggedExistingIndex(null);
    };

    const onSubmit = async (data: EditListingFormData) => {
        setIsLoading(true);
        try {
            // Update listing details
            await api.put(`/listings/${id}`, data);

            // Reorder existing images
            if (existingImages.length > 0) {
                const reorderedImages = existingImages.map((img, index) => ({
                    id: img.id,
                    order: index
                }));
                await api.put(`/listings/${id}/images/reorder`, { images: reorderedImages });
            }

            // Upload new images if any
            if (images.length > 0) {
                const formData = new FormData();
                images.forEach(image => {
                    formData.append('images', image);
                });

                await api.post(`/listings/${id}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            toast.success('Shpallja u përditësua me sukses!');
            navigate(`/listings/${id}`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Dështoi përditësimi i shpalljes.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <Layout><div className="text-center py-12">Duke ngarkuar...</div></Layout>;
    }

    return (
        <Layout>
            <div className="container-narrow py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
                        Modifiko Shpalljen
                    </h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Make */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Marka</label>
                                <select {...register('make', { required: true })} className="input-field mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10">
                                    <option value="">Zgjedh markën</option>
                                    {MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                                </select>
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Modeli</label>
                                <input type="text" {...register('model', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10" />
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Viti</label>
                                <select {...register('year', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10">
                                    {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Çmimi (€)</label>
                                <input type="number" {...register('price', { required: true, min: 1, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10" />
                            </div>

                            {/* Mileage */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kilometrazha (km)</label>
                                <input type="number" {...register('mileage', { required: true, min: 0, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10" />
                            </div>

                            {/* Fuel Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Karburanti</label>
                                <select {...register('fuelType', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10">
                                    {FUELS.map(fuel => <option key={fuel} value={fuel}>{fuel}</option>)}
                                </select>
                            </div>

                            {/* Transmission */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transmisioni</label>
                                <select {...register('transmission', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10">
                                    {TRANSMISSIONS.map(trans => <option key={trans} value={trans}>{trans}</option>)}
                                </select>
                            </div>

                            {/* Body Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Karroceria</label>
                                <select {...register('bodyType', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10">
                                    {BODY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ngjyra</label>
                                <input type="text" {...register('color', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10" />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lokacioni</label>
                                <select {...register('location', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10">
                                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            {/* Status */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Statusi</label>
                                <select
                                    {...register('status', { required: true })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                >
                                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Përshkrimi</label>
                            <textarea {...register('description', { required: true, minLength: 20 })} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fotot</label>

                            {/* Existing Images */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {existingImages.map((img, idx) => (
                                    <div
                                        key={img.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        className={`relative group aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden h-24 cursor-move ${draggedExistingIndex === idx ? 'opacity-50' : ''}`}
                                    >
                                        <img src={getImageUrl(img.imageUrl)} alt="existing" className="object-cover w-full h-full" />
                                        <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100">
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                            {idx + 1}
                                        </div>
                                    </div>
                                ))}

                                {/* New Previews */}
                                {previews.map((src, idx) => (
                                    <div key={`new-${idx}`} className="relative group aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden h-24 border-2 border-blue-500">
                                        <img src={src} alt="preview" className="object-cover w-full h-full" />
                                        <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100">
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {existingImages.length + images.length < 10 && (
                                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">Shto foto</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t flex gap-4">
                            <Button type="submit" size="lg" className="w-full sm:w-auto" isLoading={isLoading}>
                                Ruaj Ndryshimet
                            </Button>
                            <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate(`/listings/${id}`)}>
                                Anulo
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};
