import React from 'react';
import { MessageSquare, BarChart3, TrendingUp, Users, FileText, Plus, Search, Trash2 } from 'lucide-react';

interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    unread?: boolean;
    category: 'performance' | 'strategy' | 'content' | 'competitors' | 'general';
}

interface ConversationSidebarProps {
    conversations: Conversation[];
    onNewConversation: () => void;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    activeConversationId?: string;
    brandName?: string | null;
    totalMentions?: number;
    hasData?: boolean;
}

const categoryIcons = {
    performance: BarChart3,
    strategy: TrendingUp,
    content: FileText,
    competitors: Users,
    general: MessageSquare,
};

const categoryColors = {
    performance: 'text-blue-600',
    strategy: 'text-green-600',
    content: 'text-purple-600',
    competitors: 'text-orange-600',
    general: 'text-gray-600',
};

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
};

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
    conversations,
    onNewConversation,
    onSelectConversation,
    onDeleteConversation,
    activeConversationId,
    brandName,
    totalMentions = 0,
    hasData = false
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation(); // Prevent conversation selection
        onDeleteConversation(conversationId);
    };

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimestamp = (date: Date) => {
        // Handle invalid or undefined dates
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return 'Unknown date';
        }

        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
                            <p className="text-xs text-gray-600">with Amplify</p>
                        </div>
                    </div>
                    <button
                        onClick={onNewConversation}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Brand Status */}
                {brandName && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Monitoring</p>
                                <p className="text-sm font-medium text-gray-900">{brandName}</p>
                            </div>
                            {hasData && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-600">Mentions</p>
                                    <p className="text-sm font-medium text-green-600">{totalMentions}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center">
                        <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-700">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Start a new conversation with Amplify
                        </p>
                    </div>
                ) : (
                    <div className="p-2">
                        {filteredConversations.map((conversation) => {
                            const CategoryIcon = categoryIcons[conversation.category];
                            const categoryColor = categoryColors[conversation.category];

                            return (
                                <div
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(conversation.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all mb-1 group ${
                                        activeConversationId === conversation.id
                                            ? 'bg-purple-50 border border-purple-200'
                                            : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1.5 rounded ${categoryColor} bg-gray-100`}>
                                            <CategoryIcon className="w-3 h-3" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-medium text-gray-900 truncate" title={conversation.title}>
                                                    {truncateText(conversation.title, 25)}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    {conversation.unread && (
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 rounded"
                                                        title="Delete conversation"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate mb-1" title={conversation.lastMessage}>
                                                {truncateText(conversation.lastMessage, 40)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatTimestamp(conversation.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">Quick Start</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs text-gray-700 border border-gray-200">
                            <BarChart3 className="w-3 h-3 text-blue-600" />
                            Performance
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs text-gray-700 border border-gray-200">
                            <Users className="w-3 h-3 text-orange-600" />
                            Competitors
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs text-gray-700 border border-gray-200">
                            <FileText className="w-3 h-3 text-purple-600" />
                            Content
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs text-gray-700 border border-gray-200">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            Strategy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Default empty conversations for new users
export const defaultConversations: Conversation[] = [
    {
        id: '1',
        title: 'Brand Performance Analysis',
        lastMessage: 'Here\'s your weekly performance breakdown...',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        category: 'performance',
        unread: true,
    },
    {
        id: '2',
        title: 'Content Strategy Ideas',
        lastMessage: 'Based on your industry trends, I recommend...',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        category: 'content',
    },
    {
        id: '3',
        title: 'Competitor Insights',
        lastMessage: 'Your competitors are focusing on these topics...',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        category: 'competitors',
    },
];