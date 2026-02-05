import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage('Email verified successfully! You can now log in.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed. Link might be expired.');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 text-center shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-white">Email Verification</h2>

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                        <p className="text-gray-300">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="mb-4 text-emerald-400">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="mb-6 text-red-400">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
