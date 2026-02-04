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
    if (!url) return ''; // Example placeholder could be added here
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
};
