import React from 'react';
import { BarChart3, TrendingUp, Target, FileText, Search, Users } from 'lucide-react';

interface ActionCardProps {
    title: string;
    description: string;
    icon: 'analytics' | 'strategy' | 'content' | 'competitors' | 'optimization';
    action: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
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
    variant = 'primary'
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
                    <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
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

// Suggested Actions Container
interface SuggestedActionsProps {
    onAnalyzePerformance: () => void;
    onSuggestContent: () => void;
    onCompetitorAnalysis: () => void;
    onOptimizationTips: () => void;
    hasData: boolean;
}

export const SuggestedActions: React.FC<SuggestedActionsProps> = ({
    onAnalyzePerformance,
    onSuggestContent,
    onCompetitorAnalysis,
    onOptimizationTips,
    hasData
}) => {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">I can help you with:</h3>

            <div className="grid grid-cols-1 gap-3">
                <ActionCard
                    title="Performance Analysis"
                    description="Deep dive into your brand's mention trends and visibility metrics"
                    icon="analytics"
                    action="Analyze Performance"
                    onClick={onAnalyzePerformance}
                    variant={hasData ? 'primary' : 'secondary'}
                />

                <ActionCard
                    title="Content Strategy"
                    description="Get AI-powered content ideas to boost your brand visibility"
                    icon="content"
                    action="Suggest Content"
                    onClick={onSuggestContent}
                    variant="secondary"
                />

                <ActionCard
                    title="Competitor Intelligence"
                    description="Understand how competitors perform and find opportunities"
                    icon="competitors"
                    action="Competitor Analysis"
                    onClick={onCompetitorAnalysis}
                    variant="secondary"
                />

                <ActionCard
                    title="Optimization Tips"
                    description="Personalized recommendations to improve your AI visibility"
                    icon="optimization"
                    action="Get Tips"
                    onClick={onOptimizationTips}
                    variant="secondary"
                />
            </div>
        </div>
    );
};