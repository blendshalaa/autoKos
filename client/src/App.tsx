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
          console.error("Auth check failed", error);
          localStorage.removeItem('token');
        }
      }
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [setAuth]);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
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
        <Route path="/profile/:userId" element={<ProfilePage />} />

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
