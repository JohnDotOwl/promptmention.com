import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface InsightData {
    type: 'metric' | 'trend' | 'comparison' | 'recommendation' | 'alert';
    title: string;
    value?: string | number;
    change?: {
        value: number;
        isPositive: boolean;
    };
    description: string;
    action?: {
        text: string;
        onClick: () => void;
    };
}

interface InsightCardProps {
    insight: InsightData;
    compact?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, compact = false }) => {
    const getIcon = () => {
        switch (insight.type) {
            case 'metric':
                return <BarChart3 className="w-4 h-4" />;
            case 'trend':
                return insight.change?.isPositive ?
                    <TrendingUp className="w-4 h-4" /> :
                    <TrendingDown className="w-4 h-4" />;
            case 'comparison':
                return <Target className="w-4 h-4" />;
            case 'recommendation':
                return <Zap className="w-4 h-4" />;
            case 'alert':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <BarChart3 className="w-4 h-4" />;
        }
    };

    const getColors = () => {
        switch (insight.type) {
            case 'metric':
                return 'bg-blue-900/30 border-blue-700/50 text-blue-300';
            case 'trend':
                return insight.change?.isPositive ?
                    'bg-green-900/30 border-green-700/50 text-green-300' :
                    'bg-red-900/30 border-red-700/50 text-red-300';
            case 'comparison':
                return 'bg-purple-900/30 border-purple-700/50 text-purple-300';
            case 'recommendation':
                return 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300';
            case 'alert':
                return 'bg-orange-900/30 border-orange-700/50 text-orange-300';
            default:
                return 'bg-gray-800/50 border-gray-700 text-gray-300';
        }
    };

    const baseClasses = "rounded-lg border p-3 transition-all duration-200 hover:scale-[1.02]";
    const sizeClasses = compact ? "text-xs" : "text-sm";
    const colors = getColors();

    return (
        <div className={`${baseClasses} ${colors} ${sizeClasses}`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-current/10 ${
                    insight.change?.isPositive ? 'text-green-400' : 'text-current'
                }`}>
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                            {insight.title}
                        </h4>
                        {insight.value && (
                            <span className={`font-bold ${compact ? 'text-sm' : 'text-base'}`}>
                                {insight.value}
                            </span>
                        )}
                    </div>

                    {insight.change && (
                        <div className="flex items-center gap-1 mb-2">
                            {insight.change.isPositive ? (
                                <TrendingUp className="w-3 h-3 text-green-400" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-red-400" />
                            )}
                            <span className={`text-xs font-medium ${
                                insight.change.isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {insight.change.isPositive ? '+' : ''}{insight.change.value}%
                            </span>
                        </div>
                    )}

                    <p className="text-gray-300 leading-relaxed mb-3">
                        {insight.description}
                    </p>

                    {insight.action && (
                        <button
                            onClick={insight.action.onClick}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-current/10 hover:bg-current/20 transition-colors text-xs font-medium`}
                        >
                            {insight.type === 'recommendation' && <Zap className="w-3 h-3" />}
                            {insight.type === 'alert' && <AlertCircle className="w-3 h-3" />}
                            {insight.type === 'comparison' && <Target className="w-3 h-3" />}
                            {insight.action.text}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Metrics Grid Component
interface MetricsGridProps {
    metrics: InsightData[];
    columns?: 1 | 2 | 3;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, columns = 2 }) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-3`}>
            {metrics.map((metric, index) => (
                <InsightCard key={index} insight={metric} compact={true} />
            ))}
        </div>
    );
};

// Progress Bar Component
interface ProgressBarProps {
    label: string;
    value: number;
    total: number;
    color?: 'blue' | 'green' | 'yellow' | 'purple';
    showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    label,
    value,
    total,
    color = 'purple',
    showPercentage = true
}) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                {showPercentage && (
                    <span className="text-xs text-gray-300">{percentage}%</span>
                )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                    className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Status Badge Component
interface StatusBadgeProps {
    status: 'active' | 'pending' | 'warning' | 'success' | 'error';
    label: string;
    showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, showIcon = true }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'active':
                return {
                    bgColor: 'bg-blue-900/30',
                    borderColor: 'border-blue-700/50',
                    textColor: 'text-blue-300',
                    icon: <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                };
            case 'pending':
                return {
                    bgColor: 'bg-yellow-900/30',
                    borderColor: 'border-yellow-700/50',
                    textColor: 'text-yellow-300',
                    icon: <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                };
            case 'warning':
                return {
                    bgColor: 'bg-orange-900/30',
                    borderColor: 'border-orange-700/50',
                    textColor: 'text-orange-300',
                    icon: <AlertCircle className="w-3 h-3 text-orange-400" />
                };
            case 'success':
                return {
                    bgColor: 'bg-green-900/30',
                    borderColor: 'border-green-700/50',
                    textColor: 'text-green-300',
                    icon: <CheckCircle className="w-3 h-3 text-green-400" />
                };
            case 'error':
                return {
                    bgColor: 'bg-red-900/30',
                    borderColor: 'border-red-700/50',
                    textColor: 'text-red-300',
                    icon: <AlertCircle className="w-3 h-3 text-red-400" />
                };
            default:
                return {
                    bgColor: 'bg-gray-800/50',
                    borderColor: 'border-gray-700',
                    textColor: 'text-gray-300',
                    icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
            {showIcon && config.icon}
            <span>{label}</span>
        </div>
    );
};