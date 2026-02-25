import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { EditListingPage } from './pages/EditListingPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ComparePage } from './pages/ComparePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import MessagesPage from './pages/MessagesPage';
import { useAuthStore } from './store/authStore';
import api from './services/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
};

const App: React.FC = () => {
  const { setAuth } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setAuth(response.data.data.user, token);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [setAuth]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 text-sm font-medium">Duke u ngarkuar...</span>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/listings/new" element={
          <ProtectedRoute>
            <CreateListingPage />
          </ProtectedRoute>
        } />
        <Route path="/listings/:id/edit" element={
          <ProtectedRoute>
            <EditListingPage />
          </ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute>
            {/* Reuse ProfilePage logic or create distinct page. 
                For now redirecting to profile page with current user ID would be easiest */}
            {/* Better to have a distinct component or redirect behavior. 
                I'll handle this in the Nav link to point to dynamic profile ID. 
                But if /my-listings is visited directly: */}
            <MyListingsRedirect />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
      </Routes>
    </HelmetProvider>
  );
};

// Helper to redirect to own profile
const MyListingsRedirect = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(`/profile/${user.id}`);
  }, [user, navigate]);

  return null;
}

export default App;
