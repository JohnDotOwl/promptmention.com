import React from 'react';
import { User } from 'lucide-react';

interface UserMessageProps {
    content: string;
    timestamp: Date;
    avatar?: string | null;
    userName?: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({
    content,
    timestamp,
    avatar,
    userName = 'You'
}) => {
    return (
        <div className="flex justify-end mb-6 group">
            <div className="max-w-2xl space-y-2">
                {/* Message Header */}
                <div className="flex items-center justify-end gap-2 px-1">
                    <span className="text-xs text-gray-600">{userName}</span>
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={userName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-3 h-3 text-white" />
                        )}
                    </div>
                </div>

                {/* Message Content */}
                <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg transform transition-all duration-200 hover:scale-[1.02]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>

                {/* Timestamp */}
                <div className="flex justify-end px-1">
                    <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};