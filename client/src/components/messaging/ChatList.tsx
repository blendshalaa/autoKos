import React from 'react';
import type { ConversationSummary } from '../../types/definitions';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface ChatListProps {
    conversations: ConversationSummary[];
    selectedUserId: string | null;
    onSelectConversation: (userId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, selectedUserId, onSelectConversation }) => {
    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <p className="text-gray-500">No conversations yet</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.userId}
                            onClick={() => onSelectConversation(conv.userId)}
                            className={clsx(
                                "w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left",
                                selectedUserId === conv.userId && "bg-blue-50 hover:bg-blue-50"
                            )}
                        >
                            <div className="relative">
                                {conv.userAvatar ? (
                                    <img
                                        src={conv.userAvatar}
                                        alt={conv.userName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {conv.userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {conv.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="ml-4 flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-gray-900 truncate">{conv.userName}</h3>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(conv.lastMessageDate), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate mt-1">
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;
