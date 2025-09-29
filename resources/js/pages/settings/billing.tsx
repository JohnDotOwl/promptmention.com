import { Head, router } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { 
    CreditCard, 
    ChevronRight, 
    Check, 
    Zap,
    TrendingUp,
    Calendar,
    Download
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing & Usage',
        href: '/settings/billing',
    },
];

interface UsageMetric {
    name: string;
    current: number;
    max: number;
    unit?: string;
    description?: string;
}

interface PlanFeature {
    name: string;
    included: boolean;
    limit?: string;
}

export default function Billing() {
    // Mock data - replace with actual data from backend
    const currentPlan = {
        name: 'Free Plan',
        price: '$0',
        period: 'month',
        status: 'active' as const,
        nextBillingDate: null,
    };

    const usageMetrics: UsageMetric[] = [
        {
            name: 'Prompt Responses',
            current: 30,
            max: 100,
            description: 'AI-generated responses tracked this month',
        },
        {
            name: 'Analytics Events',
            current: 0,
            max: 0,
            description: 'Website analytics events tracked',
        },
        {
            name: 'Active Monitors',
            current: 1,
            max: 3,
            description: 'Brand monitoring queries',
        },
        {
            name: 'Team Members',
            current: 1,
            max: 1,
            description: 'Users in your workspace',
        },
    ];

    const planFeatures: PlanFeature[] = [
        { name: 'Brand monitoring', included: true, limit: 'Up to 3 queries' },
        { name: 'AI response tracking', included: true, limit: '100 per month' },
        { name: 'Citation analysis', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Email alerts', included: false },
        { name: 'API access', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Priority support', included: false },
    ];

    const billingHistory = [
        { date: '2025-06-01', amount: '$0.00', status: 'Free Plan', invoice: null },
    ];

    const getUsagePercentage = (current: number, max: number) => {
        if (max === 0) return 0;
        return Math.min((current / max) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Usage" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title="Billing & Usage" 
                        description="Manage your subscription and monitor usage" 
                    />

                    {/* Current Plan */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle>Current Plan</CardTitle>
                                    <CardDescription>
                                        Your subscription details and billing information
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                    {currentPlan.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-semibold">{currentPlan.name}</p>
                                    <p className="text-muted-foreground">
                                        {currentPlan.price}/{currentPlan.period}
                                    </p>
                                </div>
                                <Button>
                                    Upgrade Plan
                                    <Zap className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <p className="text-sm font-medium">Plan includes:</p>
                                <div className="grid gap-2">
                                    {planFeatures.map((feature) => (
                                        <div 
                                            key={feature.name} 
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                {feature.included ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <div className="h-4 w-4" />
                                                )}
                                                <span className={!feature.included ? 'text-muted-foreground' : ''}>
                                                    {feature.name}
                                                </span>
                                            </div>
                                            {feature.limit && feature.included && (
                                                <span className="text-xs text-muted-foreground">
                                                    {feature.limit}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Overview */}
                    <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => router.visit('/settings/billing/usage')}
                    >
                        <CardHeader>
                            <CardTitle>Usage Overview</CardTitle>
                            <CardDescription>
                                Monitor your resource usage for the current billing period
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {usageMetrics.map((metric) => (
                                <div key={metric.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{metric.name}</p>
                                            {metric.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {metric.description}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium tabular-nums">
                                            {metric.current} / {metric.max === 0 ? '∞' : metric.max}
                                            {metric.unit && ` ${metric.unit}`}
                                        </span>
                                    </div>
                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                        <div 
                                            className={`h-full transition-all ${getUsageColor(getUsagePercentage(metric.current, metric.max))}`}
                                            style={{ width: `${getUsagePercentage(metric.current, metric.max)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground">
                                    <Calendar className="inline-block h-3 w-3 mr-1" />
                                    Resets on the 1st of each month
                                </p>
                                <Button variant="outline" size="sm" onClick={(e) => {
                                    e.stopPropagation();
                                    router.visit('/settings/billing/usage');
                                }}>
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>
                                Manage your payment information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">No payment method</p>
                                        <p className="text-sm text-muted-foreground">
                                            Add a payment method to upgrade your plan
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    Add Method
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billing History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing History</CardTitle>
                            <CardDescription>
                                View and download your past invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {billingHistory.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="font-medium">{item.date}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">{item.amount}</span>
                                            {item.invoice && (
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trial CTA */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-semibold">Ready to unlock more features?</p>
                                    <p className="text-sm text-muted-foreground">
                                        Start your 7-day free trial and get access to advanced features
                                    </p>
                                </div>
                                <Button>
                                    Start Free Trial
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}