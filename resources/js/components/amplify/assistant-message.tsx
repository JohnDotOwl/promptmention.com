import React from 'react';
import { Sparkles, Search, Globe, Clock, ExternalLink, Container } from 'lucide-react';

interface AssistantMessageProps {
    content: string;
    timestamp: Date;
    isTyping?: boolean;
    richData?: {
        type: string;
        insight?: string;
        [key: string]: unknown;
    };
    searchMetadata?: {
        performed: boolean;
        query: string;
        totalResults: number;
        sources: string[];
        searchTime: string;
    };
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
    content,
    timestamp,
    isTyping = false,
    richData,
    searchMetadata
}) => {
    return (
        <div className="flex justify-start mb-6 group">
            <div className="max-w-2xl space-y-2">
                {/* Message Header */}
                <div className="flex items-center gap-2 px-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">Amplify</span>
                        {searchMetadata?.performed && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                                <Search className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Web Search</span>
                            </div>
                        )}
                        {isTyping && (
                            <span className="text-xs text-gray-600">thinking...</span>
                        )}
                    </div>
                </div>

                {/* Message Content */}
                <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md transform transition-all duration-200 hover:scale-[1.01]">
                    {isTyping ? (
                        <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                            </div>
                            <span className="text-sm text-gray-600">Generating response...</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>

                            {/* Rich Data Area (for future charts, cards, etc.) */}
                            {(richData || searchMetadata) && (
                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                    {/* Search Metadata */}
                                    {searchMetadata?.performed && (
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-900">Web Search Results</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                                                    <Container className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-700">Docker MCP</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-medium">Query:</span> "{searchMetadata.query}"
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-medium">Results:</span> {searchMetadata.totalResults} sources found
                                                </p>
                                                {searchMetadata.sources.length > 0 && (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Sources:</span> {searchMetadata.sources.slice(0, 3).join(', ')}
                                                        {searchMetadata.sources.length > 3 && ` +${searchMetadata.sources.length - 3} more`}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(searchMetadata.searchTime).toLocaleTimeString()}</span>
                                                    </div>
                                                    <a
                                                        href="https://hub.docker.com/r/mcp/duckduckgo"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors underline-offset-2 hover:underline font-medium"
                                                    >
                                                        <Container className="w-4 h-4" />
                                                        <span>Powered by Docker MCP</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rich content will be rendered here */}
                                    {richData && (
                                        <>
                                            {richData.type === 'insight' && (
                                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                                        <span className="text-xs font-medium text-purple-900">Key Insight</span>
                                                    </div>
                                                    <p className="text-xs text-gray-700">{richData.insight}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                {!isTyping && (
                    <div className="flex items-start gap-2 px-1">
                        <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};