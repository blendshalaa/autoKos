import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import type { ApiResponse, User } from '../../types/definitions';
import { toast } from 'react-hot-toast';
import {
    UsersIcon,
    FlagIcon,
    ChartBarIcon,
    TrashIcon,
    XMarkIcon,
    CheckCircleIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface DashboardStats {
    users: number;
    listings: number;
    activeListings: number;
    messages: number;
    reports: number;
}

interface Report {
    id: string;
    reason: string;
    createdAt: string;
    listing: {
        id: string;
        make: string;
        model: string;
        userId: string;
    };
    reporter: {
        id: string;
        name: string;
        email: string;
    };
}

export const AdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users'>('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, reportsRes, usersRes] = await Promise.all([
                api.get<ApiResponse<DashboardStats>>('/admin/stats'),
                api.get<ApiResponse<Report[]>>('/admin/reports'),
                api.get<ApiResponse<User[]>>('/admin/users')
            ]);
            setStats(statsRes.data.data);
            setReports(reportsRes.data.data);
            setUsers(usersRes.data.data);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleResolveReport = async (id: string, action: 'dismiss' | 'delete_listing') => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.post(`/admin/reports/${id}/resolve`, { action });
            toast.success(action === 'dismiss' ? 'Report dismissed' : 'Listing deleted');
            fetchData(); // Refresh
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleToggleBan = async (userId: string) => {
        if (!confirm('Are you sure you want to ban/unban this user?')) return;
        try {
            await api.post(`/admin/users/${userId}/ban`);
            toast.success('User status updated');
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mb-8">
                <button
                    className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('reports')}
                >
                    Reports ({stats?.reports || 0})
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
            </div>

            {/* Content */}
            {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                            <UsersIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold">{stats.users}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Active Listings</h3>
                            <ChartBarIcon className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold">{stats.activeListings} / {stats.listings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Reports</h3>
                            <FlagIcon className="h-8 w-8 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold">{stats.reports}</p>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map(report => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/listings/${report.listing.id}`} className="text-blue-600 hover:underline">
                                            {report.listing.make} {report.listing.model}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">{report.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.reporter.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleResolveReport(report.id, 'dismiss')}
                                            className="text-gray-600 hover:text-gray-900"
                                            title="Dismiss Report"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleResolveReport(report.id, 'delete_listing')}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete Listing"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No pending reports</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u.isBanned ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {u.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => handleToggleBan(u.id)}
                                                className={`text-${u.isBanned ? 'green' : 'red'}-600 hover:text-${u.isBanned ? 'green' : 'red'}-900 flex items-center`}
                                            >
                                                {u.isBanned ? (
                                                    <>
                                                        <CheckCircleIcon className="h-4 w-4 mr-1" /> Unban
                                                    </>
                                                ) : (
                                                    <>
                                                        <NoSymbolIcon className="h-4 w-4 mr-1" /> Ban
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
