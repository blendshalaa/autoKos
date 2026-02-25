import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('Socket URL:', SOCKET_URL);

let socket: Socket | null = null;

export const getSocket = (token: string | null) => {
    if (!token) {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        return null;
    }

    if (!socket || (socket.auth as any)?.token !== token) {
        if (socket) {
            socket.disconnect();
        }
        socket = io(SOCKET_URL, {
            auth: {
                token
            },
            autoConnect: false
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
