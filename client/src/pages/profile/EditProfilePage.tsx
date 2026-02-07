import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { getImageUrl } from '../../utils/format';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import type { User, ApiResponse } from '../../types/definitions';

interface EditProfileFormData {
    name: string;
    email: string; // Read-only
    phone: string;
    location: string;
    bio: string;
}

export const EditProfilePage: React.FC = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditProfileFormData>();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setValue('name', user.name);
        setValue('email', user.email);
        setValue('phone', user.phone || '');
        setValue('location', user.location || '');
        setValue('bio', user.bio || '');
    }, [user, navigate, setValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: EditProfileFormData) => {
        setIsLoading(true);
        try {
            // 1. Update text fields
            const updateResponse = await api.put<ApiResponse<{ user: User }>>('/users/me', {
                name: data.name,
                phone: data.phone,
                location: data.location,
                bio: data.bio
            });

            let updatedUser = updateResponse.data.data.user;

            // 2. Upload avatar if selected
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);

                const avatarResponse = await api.post<ApiResponse<{ user: User }>>('/users/me/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedUser = avatarResponse.data.data.user;
            }

            // Update local state
            setUser(updatedUser);
            // We need to update the token manually if it changed, but usually profile update doesn't change token
            // If we had a mechanism to refresh token, we'd do it here. 
            // For now, reliance on current token is fine as user ID didn't change.
            // Actually, we might want to update the stored user object in localStorage (handled by zustand persist)

            toast.success('Profili u përditësua me sukses!');
            navigate(`/profile/${user!.id}`);

        } catch (error: any) {
            console.error('Update failed', error);
            toast.error(error.response?.data?.error || 'Dështoi përditësimi i profilit.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container-narrow py-8">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifiko Profilin</h1>

                    <div className="mb-8 flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : user?.avatarUrl ? (
                                    <img src={getImageUrl(user.avatarUrl)} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="h-full w-full text-gray-300 bg-gray-50" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Kliko për të ndryshuar foton</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Emri i plotë</label>
                                <input
                                    type="text"
                                    {...register('name', { required: 'Emri është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (nuk mund të ndryshohet)</label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    disabled
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-500 border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Numri i telefonit</label>
                                <input
                                    type="text"
                                    {...register('phone')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="+383 4X XXX XXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lokacioni</label>
                                <input
                                    type="text"
                                    {...register('location')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="Qyteti, Shteti"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio (Përshkrim i shkurtër)</label>
                            <textarea
                                {...register('bio')}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                placeholder="Shkruani diçka rreth jush..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Anulo
                            </Button>
                            <Button type="submit" isLoading={isLoading}>
                                Ruaj Ndryshimet
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};
