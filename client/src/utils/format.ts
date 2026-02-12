export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('sq-XK', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(price);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('sq-XK').format(num);
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sq-XK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};

export const getImageUrl = (url?: string | null): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove trailing slash from baseUrl if it exists, and ensured url starts with /
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBaseUrl}${cleanUrl}`;
};
