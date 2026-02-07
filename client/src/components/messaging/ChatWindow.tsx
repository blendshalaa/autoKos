import React, { useState, useEffect, useRef } from 'react';
import type { Message, User } from '../../types/definitions';
import { format } from 'date-fns';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

interface ChatWindowProps {
    recipient: User | { id: string, name: string, avatarUrl: string | null } | null;
    messages: Message[];
    onSendMessage: (content: string) => void;
    currentUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipient, messages, onSendMessage, currentUserId }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (!recipient) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm">
                {recipient.avatarUrl ? (
                    <img
                        src={recipient.avatarUrl}
                        alt={recipient.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {recipient.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{recipient.name}</h3>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex flex-col max-w-[75%]",
                            msg.senderId === currentUserId ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        <div
                            className={clsx(
                                "px-4 py-2 rounded-2xl shadow-sm",
                                msg.senderId === currentUserId
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white text-gray-800 rounded-bl-none"
                            )}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {format(new Date(msg.createdAt), 'p')}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
