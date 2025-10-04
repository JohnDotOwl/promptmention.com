import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import { UserMessage } from '@/components/amplify/user-message';
import { AssistantMessage } from '@/components/amplify/assistant-message';
import { SuggestedActions } from '@/components/amplify/action-card';
import { ConversationSidebar, defaultConversations } from '@/components/amplify/conversation-sidebar';

// Define TypeScript interfaces
interface BrandContext {
    brandName?: string | null;
    website?: string | null;
    totalMentions: number;
    visibilityScore: number;
    hasData: boolean;
    competitors: Array<{
        name: string;
        industry?: string;
    }>;
    recentActivity: boolean;
}

interface ConversationMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    richData?: {
        type: 'insight' | 'metrics' | 'comparison' | 'recommendation';
        data: Record<string, unknown>;
    };
    isTyping?: boolean;
    aiModel?: string;
    aiProvider?: string;
    isStreamed?: boolean;
}


interface AIModel {
    id: string;
    name: string;
    provider: string;
    description: string;
    features: string[];
    streaming?: boolean;
    recommended?: boolean;
    maxTokens?: number;
}

interface AmplifyProps extends SharedData {
    brandContext: BrandContext;
    conversationHistory: {
        conversations: Message[];
        hasHistory: boolean;
    };
    suggestedPrompts: Record<string, { title: string; description: string; category: string }>;
    initialMessage: string;
    availableModels: Record<string, AIModel>;
    userPreferredModel: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Amplify',
        href: '/amplify',
    },
];

export default function Amplify({ auth, brandContext, suggestedPrompts, initialMessage, availableModels, userPreferredModel }: AmplifyProps) {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [conversations, setConversations] = useState(defaultConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [selectedModel, setSelectedModel] = useState<string>(userPreferredModel || 'cerebras-gpt-oss-120b');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize with AI greeting
    useEffect(() => {
        if (messages.length === 0 && initialMessage) {
            setMessages([{
                id: '1',
                type: 'assistant',
                content: initialMessage,
                timestamp: new Date(),
            }]);
        }
    }, [initialMessage, messages.length]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    
    const handleSendMessage = useCallback(async (message: string, conversationId?: string | null) => {
        if (!message.trim()) return;

        // Add user message immediately for better UX
        const userMessage: ConversationMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        setShowSuggestions(false);

        // Always use streaming for Cerebras model, even if availableModels is empty
        const currentModel = availableModels[selectedModel];
        const useStreaming = selectedModel === 'cerebras-gpt-oss-120b' || currentModel?.streaming;

        if (useStreaming) {
            await handleStreamingMessage(message, conversationId);
        } else {
            await handleRegularMessage(message, conversationId);
        }
    }, [availableModels, selectedModel, handleStreamingMessage, handleRegularMessage]);

    const handleStreamingMessage = async (message: string, conversationId?: string | null) => {
        // Create placeholder for streaming message
        const messageId = (Date.now() + 1).toString();
        setStreamingMessageId(messageId);

        const streamingMessage: ConversationMessage = {
            id: messageId,
            type: 'assistant',
            content: '',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, streamingMessage]);

        try {
            const response = await fetch('/amplify/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: conversationId || activeConversationId,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start streaming');
            }

            setIsStreaming(true);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('Failed to get response reader');
            }

            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'content') {
                                accumulatedContent += data.content;
                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === messageId
                                            ? { ...msg, content: accumulatedContent }
                                            : msg
                                    )
                                );
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            } else if (data.type === 'done') {
                                setIsStreaming(false);
                                setStreamingMessageId(null);

                                // Update final message with model info
                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === messageId
                                            ? {
                                                ...msg,
                                                aiModel: selectedModel,
                                                aiProvider: 'cerebras',
                                                isStreamed: true
                                            }
                                            : msg
                                    )
                                );
                                return;
                            }
                        } catch {
                            // Ignore JSON parse errors for partial chunks
                            continue;
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Streaming failed:', error);

            // Remove streaming message and show error
            setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));

            const errorMessage: ConversationMessage = {
                id: (Date.now() + 2).toString(),
                type: 'assistant',
                content: 'Sorry, I encountered an error connecting to the AI service. Please try again.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsStreaming(false);
            setIsTyping(false);
            setStreamingMessageId(null);
        }
    };

    const handleRegularMessage = async (message: string, conversationId?: string | null) => {
        try {
            const response = await fetch('/amplify/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: conversationId || activeConversationId,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // Add AI response
            const aiResponse: ConversationMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: data.response.content,
                timestamp: new Date(),
                richData: data.response.richData,
                aiModel: data.model || selectedModel,
                aiProvider: data.response?.provider || 'brand-assistant',
            };

            setMessages(prev => [...prev, aiResponse]);

            // Update conversation ID if new conversation was created
            if (data.conversation_id && !activeConversationId) {
                setActiveConversationId(data.conversation_id);
            }

        } catch (error) {
            console.error('Failed to send message:', error);

            // Add error message from assistant
            const errorMessage: ConversationMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: 'Sorry, I encountered an error processing your message. Please try again.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputMessage);
        }
    };

    const startRecording = () => {
        setIsRecording(true);
        // Voice recording logic would go here
    };

    const stopRecording = () => {
        setIsRecording(false);
        // Voice recording stop logic would go here
    };

    
    const handleNewConversation = async () => {
        try {
            // Create new conversation via API
            const response = await fetch('/amplify/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    title: 'New Conversation',
                    category: 'general',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create conversation');
            }

            const data = await response.json();

            // Reset state for new conversation
            setMessages([]);
            setActiveConversationId(data.conversation.id);
            setShowSuggestions(true);

            // Re-initialize with greeting
            if (initialMessage) {
                setMessages([{
                    id: Date.now().toString(),
                    type: 'assistant',
                    content: initialMessage,
                    timestamp: new Date(),
                }]);
            }

            // Refresh conversation list
            await loadConversations();

        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    const handleSelectConversation = async (conversationId: string) => {
        setActiveConversationId(conversationId);
        setShowSuggestions(false);

        try {
            // Load conversation messages via API
            const response = await fetch(`/amplify/conversations/${conversationId}/messages`);

            if (!response.ok) {
                throw new Error('Failed to load conversation');
            }

            const data = await response.json();

            // Convert API messages to our format
            const apiMessages = data.messages.map((msg: Message) => ({
                id: msg.id.toString(),
                type: msg.type as 'user' | 'assistant',
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                richData: msg.richData,
            }));

            setMessages(apiMessages);

        } catch (error) {
            console.error('Failed to load conversation:', error);

            // Show error state
            setMessages([{
                id: Date.now().toString(),
                type: 'assistant',
                content: 'Sorry, I couldn\'t load this conversation. Please try again.',
                timestamp: new Date(),
            }]);
        }
    };

    const loadConversations = async () => {
        try {
            const response = await fetch('/amplify/conversations');

            if (!response.ok) {
                throw new Error('Failed to load conversations');
            }

            const data = await response.json();

            // Convert API conversations to our format
            const apiConversations = data.conversations.map((conv: { id: number; title: string; created_at: string }) => ({
                id: conv.id,
                title: conv.title,
                lastMessage: conv.lastMessage,
                timestamp: new Date(conv.timestamp),
                unread: conv.unread,
                category: conv.category,
            }));

            setConversations(apiConversations);

        } catch (error) {
            console.error('Failed to load conversations:', error);
            // Keep default conversations on error
        }
    };

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Listen for custom prompt execution events
    useEffect(() => {
        const handleExecutePrompt = (event: CustomEvent) => {
            const prompt = event.detail;
            if (prompt && typeof prompt === 'string') {
                handleSendMessage(prompt);
            }
        };

        // Add event listener
        window.addEventListener('executePrompt', handleExecutePrompt as EventListener);

        // Cleanup
        return () => {
            window.removeEventListener('executePrompt', handleExecutePrompt as EventListener);
        };
    }, [handleSendMessage]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Amplify" />

            <div className="flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
                {/* Page Header */}
                <div className="relative z-10 py-6 border-b bg-white">
                    <div className="px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Amplify</h1>
                                <p className="text-muted-foreground mt-1">
                                    AI-powered assistant to amplify your brand visibility and insights
                                </p>
                            </div>
                            {/* Model Info */}
                            <div className="text-right">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">GPT-OSS-120B</span>
                                    <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                                        Powered by Cerebras AI
                                    </span>
                                </div>
                                {isStreaming && (
                                    <div className="flex items-center justify-end space-x-2 text-sm text-blue-600 mt-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                        <span>Streaming response...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Conversation History */}
                    <div className="h-full">
                        <ConversationSidebar
                        conversations={conversations}
                        onNewConversation={handleNewConversation}
                        onSelectConversation={handleSelectConversation}
                        activeConversationId={activeConversationId}
                        brandName={brandContext.brandName}
                        totalMentions={brandContext.totalMentions}
                        hasData={brandContext.hasData}
                    />
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-4xl mx-auto">
                            {/* Show suggested actions when chat is empty */}
                            {showSuggestions && messages.length <= 1 && (
                                <div className="mb-8">
                                    <SuggestedActions
                                        onAnalyzePerformance={() => {}}
                                        onSuggestContent={() => {}}
                                        onCompetitorAnalysis={() => {}}
                                        onOptimizationTips={() => {}}
                                        hasData={brandContext.hasData}
                                        suggestedPrompts={suggestedPrompts}
                                    />
                                </div>
                            )}

                            {/* Render messages using new components */}
                            {messages.map((message) => (
                                <div key={message.id}>
                                    {message.type === 'user' ? (
                                        <UserMessage
                                            content={message.content}
                                            timestamp={message.timestamp}
                                            userName={auth.user?.name}
                                        />
                                    ) : (
                                        <AssistantMessage
                                            content={message.content}
                                            timestamp={message.timestamp}
                                            isTyping={message.isTyping}
                                            richData={message.richData}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <AssistantMessage
                                    content=""
                                    timestamp={new Date()}
                                    isTyping={true}
                                />
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything about your brand's visibility..."
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        disabled={isTyping || isStreaming}
                                    />
                                    {isRecording ? (
                                        <button
                                            onClick={stopRecording}
                                            className="absolute right-3 bottom-3 text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <Square className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={startRecording}
                                            className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <Mic className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleSendMessage(inputMessage)}
                                    disabled={!inputMessage.trim() || isTyping || isStreaming}
                                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 transition-all flex items-center gap-2"
                                >
                                    {isStreaming ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {isStreaming ? 'Streaming...' : 'Send'}
                                </button>
                            </div>

                            <p className="text-xs text-gray-600 mt-3 text-center">
                                Amplify analyzes your brand data to provide personalized insights and recommendations
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </AppLayout>
    );
}