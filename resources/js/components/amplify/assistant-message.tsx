import React from 'react';
import { Sparkles } from 'lucide-react';

interface AssistantMessageProps {
    content: string;
    timestamp: Date;
    isTyping?: boolean;
    richData?: any;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
    content,
    timestamp,
    isTyping = false,
    richData
}) => {
    return (
        <div className="flex justify-start mb-6 group">
            <div className="max-w-2xl space-y-2">
                {/* Message Header */}
                <div className="flex items-center gap-2 px-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-900">Amplify</span>
                        {isTyping && (
                            <span className="text-xs text-gray-600 ml-2">thinking...</span>
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
                            {richData && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    {/* Rich content will be rendered here */}
                                    {richData.type === 'insight' && (
                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                <span className="text-xs font-medium text-purple-900">Key Insight</span>
                                            </div>
                                            <p className="text-xs text-gray-700">{richData.insight}</p>
                                        </div>
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