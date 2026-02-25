import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import ChatList from '../components/messaging/ChatList';
import ChatWindow from '../components/messaging/ChatWindow';
import { useSocket } from '../hooks/useSocket';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import type { ConversationSummary, Message, User } from '../types/definitions';
import toast from 'react-hot-toast';

const MessagesPage: React.FC = () => {
    const { user } = useAuthStore();
    const { socket, isConnected, sendMessage } = useSocket();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedRecipient, setSelectedRecipient] = useState<User | { id: string, name: string, avatarUrl: string | null } | null>(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const state = location.state as { recipientId?: string, listingId?: string, recipient?: any } | null;

    // Fetch conversations and handle initial state
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.get('/messages/conversations');
                if (response.data.success && response.data.data) {
                    let convs = Array.isArray(response.data.data.conversations)
                        ? response.data.data.conversations
                        : (Array.isArray(response.data.data) ? response.data.data : []);

                    // If we have a recipient from state that is NOT in the fetched conversations,
                    // add a placeholder so they appear in the list.
                    if (state?.recipientId && Array.isArray(convs) && !convs.find((c: any) => c.userId === state.recipientId)) {
                        const placeholder: ConversationSummary = {
                            userId: state.recipientId,
                            userName: state.recipient?.name || 'User',
                            userAvatar: state.recipient?.avatarUrl || null,
                            lastMessage: 'Filloni të bisedoni...',
                            lastMessageDate: new Date().toISOString(),
                            unreadCount: 0
                        };
                        convs = [placeholder, ...convs];
                    }

                    setConversations(Array.isArray(convs) ? convs : []);
                }
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
                toast.error('Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        // If we have a recipient from state, select them initially
        if (state?.recipientId) {
            setSelectedUserId(state.recipientId);
            if (state.recipient) {
                setSelectedRecipient(state.recipient);
            }
        }

        fetchConversations();
    }, [state?.recipientId, state?.recipient]);

    // Fetch messages when a conversation is selected
    useEffect(() => {
        if (!selectedUserId) return;

        let isMounted = true;

        const fetchConversation = async () => {
            try {
                const response = await api.get(`/messages/conversations/${selectedUserId}`);
                if (response.data.success && isMounted) {
                    setMessages(response.data.data.messages);

                    // Update selected recipient
                    const firstMsg = response.data.data.messages[0];
                    if (firstMsg) {
                        const recipient = firstMsg.senderId === selectedUserId ? firstMsg.sender : firstMsg.receiver;
                        if (recipient) {
                            setSelectedRecipient(recipient);
                        }
                    } else {
                        const conv = Array.isArray(conversations) ? conversations.find(c => c.userId === selectedUserId) : null;
                        if (conv) {
                            setSelectedRecipient({
                                id: conv.userId,
                                name: conv.userName,
                                avatarUrl: conv.userAvatar
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                toast.error('Failed to load messages');
            }
        };

        fetchConversation();

        return () => {
            isMounted = false;
        };
    }, [selectedUserId, conversations]);

    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (newMessage: Message) => {
            console.log('📥 Message received:', newMessage);
            // If the message is from the currently selected user, add it to the messages list
            if (newMessage.senderId === selectedUserId || newMessage.receiverId === selectedUserId) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
            }

            // Update conversations list summary
            setConversations((prev) => {
                if (!Array.isArray(prev)) return [];
                const existingConvIndex = prev.findIndex(c => c.userId === (newMessage.senderId === user?.id ? newMessage.receiverId : newMessage.senderId));

                if (existingConvIndex > -1) {
                    const updatedConvs = [...prev];

                    updatedConvs[existingConvIndex] = {
                        ...updatedConvs[existingConvIndex],
                        lastMessage: newMessage.message,
                        lastMessageDate: newMessage.createdAt,
                        unreadCount: (newMessage.senderId !== user?.id && selectedUserId !== newMessage.senderId)
                            ? updatedConvs[existingConvIndex].unreadCount + 1
                            : updatedConvs[existingConvIndex].unreadCount
                    };

                    // Move to top
                    const item = updatedConvs.splice(existingConvIndex, 1)[0];
                    updatedConvs.unshift(item);

                    return updatedConvs;
                } else {
                    // New conversation
                    const otherUser = newMessage.senderId === user?.id ? newMessage.receiver : newMessage.sender;
                    if (!otherUser) return prev;

                    const newConv: ConversationSummary = {
                        userId: otherUser.id,
                        userName: otherUser.name,
                        userAvatar: otherUser.avatarUrl,
                        lastMessage: newMessage.message,
                        lastMessageDate: newMessage.createdAt,
                        unreadCount: newMessage.senderId !== user?.id ? 1 : 0
                    };
                    return [newConv, ...prev];
                }
            });
        };

        socket.on('receive_message', handleReceiveMessage);

        socket.on('message_error', (data: { error: string }) => {
            console.error('❌ Socket error:', data.error);
            toast.error(data.error);
        });

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_error');
        };
    }, [socket, selectedUserId, user?.id]);

    const handleSendMessage = (content: string) => {
        if (!selectedUserId) return;

        // Find if we have a listingId to associate with (for first message usually)
        // For simplicity in this UI, we'll try to get it from the last message
        const lastMsg = messages[messages.length - 1];
        const listingId = lastMsg?.listingId || state?.listingId;

        if (!listingId) {
            toast.error('Could not find listing context');
            return;
        }

        sendMessage(selectedUserId, listingId, content);
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-160px)]">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex h-full border border-gray-100">
                    {/* Chat List */}
                    <div className="w-1/3 min-w-[320px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <ChatList
                                conversations={conversations}
                                selectedUserId={selectedUserId}
                                onSelectConversation={setSelectedUserId}
                            />
                        )}
                    </div>

                    {/* Chat Window */}
                    <div className="flex-1">
                        <ChatWindow
                            recipient={selectedRecipient}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            currentUserId={user?.id || ''}
                        />
                    </div>
                </div>

                {!isConnected && (
                    <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 text-center rounded-lg text-sm">
                        Jeni të shkëputur. Duke u përpjekur të rilidhemi...
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MessagesPage;
