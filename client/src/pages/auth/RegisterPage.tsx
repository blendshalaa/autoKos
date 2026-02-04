import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import type { AuthResponse, ApiResponse } from "../../types/definitions";

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    location: string;
}

export const RegisterPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
    const [isLoading, setIsLoading] = useState(false);
    const setAuth = useAuthStore(state => state.setAuth);
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
            setAuth(response.data.data.user, response.data.data.token);
            toast.success('Llogaria u krijua me sukses!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Dështoi regjistrimi. Provoni përsëri.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                            Krijo llogari të re
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Ose{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                kyçu në llogarinë ekzistuese
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 rounded-md shadow-sm">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Emri i plotë</label>
                                <input
                                    type="text"
                                    {...register('name', { required: 'Emri është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    {...register('email', { required: 'Email është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lokacioni</label>
                                <input
                                    type="text"
                                    {...register('location')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                    placeholder="psh. Prishtinë"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fjalëkalimi</label>
                                <input
                                    type="password"
                                    {...register('password', {
                                        required: 'Fjalëkalimi është i detyrueshëm',
                                        minLength: { value: 6, message: 'Minimum 6 karaktere' }
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Regjistrohu
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};
