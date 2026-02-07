import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../lib/socket';
import toast from 'react-hot-toast';

export const useSocket = () => {
    const { token, user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token || !user) {
            if (socketRef.current) {
                console.log('🔌 Socket disconnecting: no token or user');
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        const socket = getSocket(token);
        if (!socket) return;

        socketRef.current = socket;

        const onConnect = () => {
            console.log('✅ Socket connected');
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        };

        const onConnectError = (err: any) => {
            console.error('⚠️ Socket connection error:', err.message);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

        if (!socket.connected) {
            console.log('🔌 Socket connecting...');
            socket.connect();
        } else {
            setIsConnected(true);
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
        };
    }, [token, user]);

    const sendMessage = (receiverId: string, listingId: string, content: string) => {
        if (socketRef.current && socketRef.current.connected) {
            console.log('📤 Sending message:', { receiverId, listingId, contentLength: content.length });
            socketRef.current.emit('send_message', {
                receiverId,
                listingId,
                content
            });
        } else {
            console.warn('🚫 Cannot send message: socket not connected', {
                hasSocket: !!socketRef.current,
                connected: socketRef.current?.connected
            });
            toast.error('Lidhja me serverin dështoi. Provoni përsëri.');
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        sendMessage
    };
};
