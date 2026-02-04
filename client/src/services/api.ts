import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401 Unauthorized, clear token and potential redirect (handled by protected routes mostly)
        if (error.response && error.response.status === 401) {
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                // Only clear and redirect if we're not already trying to auth
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // We might want to trigger a global state update here or use an event
                // to redirect the user to login. For now, rely on auth checking in routes.
            }
        }
        return Promise.reject(error);
    }
);

export default api;
