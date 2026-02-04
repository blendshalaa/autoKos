import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import type { AuthResponse, ApiResponse } from '../../types/definitions';

interface LoginFormData {
    email: string;
    password: string;
}

export const LoginPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const [isLoading, setIsLoading] = useState(false);
    const setAuth = useAuthStore(state => state.setAuth);
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
            setAuth(response.data.data.user, response.data.data.token);
            toast.success('Mirësevini përsëri!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Dështoi kyçja. Ju lutem provoni përsëri.');
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
                            Kyçu në llogarinë tuaj
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Ose{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                regjistrohu për një llogari të re
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 rounded-md shadow-sm">
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
                                <label className="block text-sm font-medium text-gray-700">Fjalëkalimi</label>
                                <input
                                    type="password"
                                    {...register('password', { required: 'Fjalëkalimi është i detyrueshëm' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-10"
                                />
                                {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Kyçu
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};
