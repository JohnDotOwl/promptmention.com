import React, { useState } from 'react';
import { BarChart3, TrendingUp, Target, FileText, Search, Users, Info, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ActionCardProps {
    title: string;
    description: string;
    icon: 'analytics' | 'strategy' | 'content' | 'competitors' | 'optimization';
    action: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    dataInsight?: DataInsight;
}

const iconMap = {
    analytics: BarChart3,
    strategy: TrendingUp,
    content: FileText,
    competitors: Users,
    optimization: Target,
};

export const ActionCard: React.FC<ActionCardProps> = ({
    title,
    description,
    icon,
    action,
    onClick,
    variant = 'primary',
    dataInsight
}) => {
    const Icon = iconMap[icon];

    const baseClasses = "rounded-xl p-4 border transition-all duration-200 cursor-pointer transform hover:scale-[1.02] shadow-md hover:shadow-lg";

    const variantClasses = variant === 'primary'
        ? "bg-purple-50 border-purple-200 hover:border-purple-300"
        : "bg-white border-gray-200 hover:border-gray-300";

    return (
        <div className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                    variant === 'primary'
                        ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                }`}>
                    <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{title}</h4>
                        {dataInsight && (
                            <DataInsightDialog dataInsight={dataInsight} />
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>

                    <button className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        variant === 'primary'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                        {action}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Quick Action Button Component
interface QuickActionProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: 'purple' | 'blue' | 'green' | 'orange';
}

export const QuickAction: React.FC<QuickActionProps> = ({
    label,
    icon,
    onClick,
    color = 'purple'
}) => {
    const colorClasses = {
        purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
        blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
        green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
        orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-[1.02] ${colorClasses[color]}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

// Personalized prompt data structure
interface PromptData {
    title: string;
    description: string;
    action: string;
    prompt: string;
    variant: 'primary' | 'secondary';
    data_driven: boolean;
}

// Data Insight structure
interface DataInsight {
    has_data: boolean;
    metrics: string[];
    message: string;
}

// Data Insight Dialog Component
interface DataInsightDialogProps {
    dataInsight: DataInsight;
}

export const DataInsightDialog: React.FC<DataInsightDialogProps> = ({ dataInsight }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className={`p-1 rounded-full transition-colors ${
                    dataInsight.has_data
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                }`}
                title="Click to view data insights"
            >
                <Info className="w-3 h-3" />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                                dataInsight.has_data
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                                <Info className="w-5 h-5" />
                            </div>
                            <DialogTitle className="text-lg font-semibold">
                                Data Insights
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            {dataInsight.has_data
                                ? "Here are the data-driven insights for this recommendation:"
                                : "No data available for this recommendation yet."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-6">
                        {dataInsight.has_data && dataInsight.metrics.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Key Metrics
                                </h4>
                                <div className="space-y-3">
                                    {dataInsight.metrics.map((metric, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-gray-700 leading-relaxed text-sm">
                                                {metric}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Recommendation
                                </h4>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                    {dataInsight.message}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            {dataInsight.has_data
                                ? "These insights are based on your current brand performance data"
                                : "Start monitoring your brand to see personalized insights here"
                            }
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

// Suggested Actions Container
interface SuggestedActionsProps {
    onAnalyzePerformance: () => void;
    onSuggestContent: () => void;
    onCompetitorAnalysis: () => void;
    onOptimizationTips: () => void;
    hasData: boolean;
    suggestedPrompts?: {
        performance_analysis?: PromptData & { data_insight?: DataInsight };
        content_strategy?: PromptData & { data_insight?: DataInsight };
        competitor_intelligence?: PromptData & { data_insight?: DataInsight };
        optimization_tips?: PromptData & { data_insight?: DataInsight };
    };
}

export const SuggestedActions: React.FC<SuggestedActionsProps> = ({
    onAnalyzePerformance,
    onSuggestContent,
    onCompetitorAnalysis,
    onOptimizationTips,
    hasData,
    suggestedPrompts
}) => {
    // Create dynamic action handlers that use the personalized prompts
    const handlePerformanceAnalysis = () => {
        const prompt = suggestedPrompts?.performance_analysis?.prompt || 'How did our brand perform this week?';
        onAnalyzePerformance();
        // Execute the personalized prompt by sending it as a message
        setTimeout(() => {
            const event = new CustomEvent('executePrompt', { detail: prompt });
            window.dispatchEvent(event);
        }, 100);
    };

    const handleContentStrategy = () => {
        const prompt = suggestedPrompts?.content_strategy?.prompt || 'Suggest content ideas for our brand';
        onSuggestContent();
        setTimeout(() => {
            const event = new CustomEvent('executePrompt', { detail: prompt });
            window.dispatchEvent(event);
        }, 100);
    };

    const handleCompetitorAnalysis = () => {
        const prompt = suggestedPrompts?.competitor_intelligence?.prompt || 'Analyze our competitor performance';
        onCompetitorAnalysis();
        setTimeout(() => {
            const event = new CustomEvent('executePrompt', { detail: prompt });
            window.dispatchEvent(event);
        }, 100);
    };

    const handleOptimizationTips = () => {
        const prompt = suggestedPrompts?.optimization_tips?.prompt || 'How can we improve our visibility?';
        onOptimizationTips();
        setTimeout(() => {
            const event = new CustomEvent('executePrompt', { detail: prompt });
            window.dispatchEvent(event);
        }, 100);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">I can help you with:</h3>

            <div className="grid grid-cols-1 gap-3">
                <ActionCard
                    title={suggestedPrompts?.performance_analysis?.title || "Performance Analysis"}
                    description={suggestedPrompts?.performance_analysis?.description || "Deep dive into your brand's mention trends and visibility metrics"}
                    icon="analytics"
                    action={suggestedPrompts?.performance_analysis?.action || "Analyze Performance"}
                    onClick={handlePerformanceAnalysis}
                    variant={suggestedPrompts?.performance_analysis?.variant || (hasData ? 'primary' : 'secondary')}
                    dataInsight={suggestedPrompts?.performance_analysis?.data_insight}
                />

                <ActionCard
                    title={suggestedPrompts?.content_strategy?.title || "Content Strategy"}
                    description={suggestedPrompts?.content_strategy?.description || "Get AI-powered content ideas to boost your brand visibility"}
                    icon="content"
                    action={suggestedPrompts?.content_strategy?.action || "Suggest Content"}
                    onClick={handleContentStrategy}
                    variant={suggestedPrompts?.content_strategy?.variant || 'secondary'}
                    dataInsight={suggestedPrompts?.content_strategy?.data_insight}
                />

                <ActionCard
                    title={suggestedPrompts?.competitor_intelligence?.title || "Competitor Intelligence"}
                    description={suggestedPrompts?.competitor_intelligence?.description || "Understand how competitors perform and find opportunities"}
                    icon="competitors"
                    action={suggestedPrompts?.competitor_intelligence?.action || "Competitor Analysis"}
                    onClick={handleCompetitorAnalysis}
                    variant={suggestedPrompts?.competitor_intelligence?.variant || 'secondary'}
                    dataInsight={suggestedPrompts?.competitor_intelligence?.data_insight}
                />

                <ActionCard
                    title={suggestedPrompts?.optimization_tips?.title || "Optimization Tips"}
                    description={suggestedPrompts?.optimization_tips?.description || "Personalized recommendations to improve your AI visibility"}
                    icon="optimization"
                    action={suggestedPrompts?.optimization_tips?.action || "Get Tips"}
                    onClick={handleOptimizationTips}
                    variant={suggestedPrompts?.optimization_tips?.variant || 'secondary'}
                    dataInsight={suggestedPrompts?.optimization_tips?.data_insight}
                />
            </div>
        </div>
    );
};