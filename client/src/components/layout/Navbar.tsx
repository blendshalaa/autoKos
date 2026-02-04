import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react'; // Need to install headlessui later or implement custom dropdown
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../utils/format';
import { Button } from '../common/Button';

// Mimicking Headless UI for now since I forgot to add it to package.json
// Or I can just use simple state for dropdowns if needed, but let's assume we'll just check if it's installed.
// Since I can't check installed packages easily right now, I'll implement a simple dropdown manually OR 
// I'll add headlessui to the install list. Let's add it.

export const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container-narrow">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-blue-600">AutoKos</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                            Ballina
                        </Link>

                        <Link to="/listings/new">
                            <Button size="sm">Shto Makinë</Button>
                        </Link>

                        {isAuthenticated && user ? (
                            <div className="ml-3 relative">
                                <div>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center gap-2"
                                    >
                                        <span className="hidden md:block text-gray-700 font-medium">{user.name}</span>
                                        {user.avatarUrl ? (
                                            <img
                                                className="h-8 w-8 rounded-full object-cover"
                                                src={getImageUrl(user.avatarUrl)}
                                                alt={user.name}
                                            />
                                        ) : (
                                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Link
                                            to={`/profile/${user.id}`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            Profili Im
                                        </Link>
                                        <Link
                                            to="/my-listings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            Shpalljet e Mia
                                        </Link>
                                        <Link
                                            to="/messages"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            Mesazhet
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Dil
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Kyçu</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="outline" size="sm">Regjistrohu</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex item-center sm:hidden items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden block bg-white border-t border-gray-200">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Ballina
                        </Link>
                        <Link
                            to="/listings/new"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Shto Makinë
                        </Link>
                    </div>

                    {isAuthenticated && user ? (
                        <div className="pt-4 pb-4 border-t border-gray-200">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    {user.avatarUrl ? (
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={getImageUrl(user.avatarUrl)}
                                            alt={user.name}
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <Link
                                    to={`/profile/${user.id}`}
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profili Im
                                </Link>
                                <Link
                                    to="/my-listings"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Shpalljet e Mia
                                </Link>
                                <Link
                                    to="/messages"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Mesazhet
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
                                >
                                    Dil
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-4 border-t border-gray-200">
                            <div className="space-y-1">
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Kyçu
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Regjistrohu
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};
