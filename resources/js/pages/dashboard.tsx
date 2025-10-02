import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
// import { usePartialReloadPolling } from '@/hooks/use-smart-polling'; // Disabled - causing Inertia router issues
import WaitlistDialog from '@/components/WaitlistDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SkeletonCard } from '@/components/ui/skeleton-card';

interface DashboardMetrics {
    totalMonitors: number;
    totalPrompts: number;
    totalResponses: number;
    visibilityScore: number;
    mentionsThisWeek: number;
    responseRate: number;
}

interface DashboardChartData {
    timeline: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            borderColor: string;
            backgroundColor: string;
        }>;
    };
    modelUsage: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    citedDomains: Array<{
        domain: string;
        mentions: number;
        percentage: number;
    }>;
}

interface DashboardActivity {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    icon: string;
}

interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        waitlist_joined_at: string | null;
    };
    metrics?: DashboardMetrics;
    chartData?: DashboardChartData;
    recentActivity?: DashboardActivity[];
    monitorStatus?: {
        active: number;
        pending: number;
        failed: number;
        total: number;
    };
    queueStatus?: {
        domain_analysis: { pending: number; processing: number };
        prompt_generation: { pending: number; processing: number };
        monitor_setup: { pending: number; processing: number };
        total_jobs: number;
    };
    dashboardData?: any;
    projectName?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const {
        user,
        metrics,
        chartData,
        recentActivity,
        monitorStatus,
        queueStatus,
        dashboardData,
        projectName
    } = usePage<SharedData & DashboardProps>().props;

    const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading state for better UX
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // Polling disabled - causing issues with Inertia router
    // TODO: Re-enable and fix Inertia integration issues later
    /*
    const metricsPolling = usePartialReloadPolling(['metrics'], {
        interval: 30000, // 30 seconds
        priority: 'medium',
        pauseWhenHidden: true,
        shouldPoll: () => true // Always poll metrics
    });

    const realtimePolling = usePartialReloadPolling(['recentActivity', 'queueStatus'], {
        interval: 10000, // 10 seconds
        priority: 'high',
        pauseWhenHidden: true,
        shouldPoll: () => (queueStatus?.total_jobs ?? 0) > 0 // Poll when there are active jobs
    });

    const chartPolling = usePartialReloadPolling(['chartData'], {
        interval: 60000, // 1 minute
        priority: 'low',
        pauseWhenHidden: true,
        shouldPoll: () => true
    });

    const monitorStatusPolling = usePartialReloadPolling(['monitorStatus'], {
        interval: 15000, // 15 seconds
        priority: 'medium',
        pauseWhenHidden: true,
        shouldPoll: () => (monitorStatus?.pending ?? 0) > 0
    });
    */

    // Polling startup disabled - causing Inertia router issues
    /*
    useEffect(() => {
        // Prevent re-initialization of polling
        if (pollingInitialized.current) return;

        // Wait for initial page load to complete before starting polling
        const startPollingTimer = setTimeout(() => {
            pollingInitialized.current = true;

            // Always poll metrics and charts
            metricsPolling.startPartialPolling();
            chartPolling.startPartialPolling();

            // Poll real-time data if there are active jobs
            if ((queueStatus?.total_jobs ?? 0) > 0) {
                realtimePolling.startPartialPolling();
            }

            // Poll monitor status if there are pending monitors
            if ((monitorStatus?.pending ?? 0) > 0) {
                monitorStatusPolling.startPartialPolling();
            }
        }, 2000); // 2 second delay to ensure page is fully loaded

        return () => {
            clearTimeout(startPollingTimer);
            metricsPolling.stopPolling();
            realtimePolling.stopPolling();
            chartPolling.stopPolling();
            monitorStatusPolling.stopPolling();
        };
    }, []); // Empty dependency array - only run once on mount
    */

    // Waitlist dialog logic
    useEffect(() => {
        if (user.waitlist_joined_at) {
            const joinedAt = new Date(user.waitlist_joined_at);
            const now = new Date();
            const timeDiff = now.getTime() - joinedAt.getTime();
            const minutesDiff = timeDiff / (1000 * 60);

            const dialogShown = localStorage.getItem(`waitlist-dialog-shown-${user.id}`);
            if (minutesDiff <= 5 && !dialogShown) {
                setShowWaitlistDialog(true);
                localStorage.setItem(`waitlist-dialog-shown-${user.id}`, 'true');
            }
        }
    }, [user]);


    const handleCloseWaitlistDialog = (open: boolean) => {
        setShowWaitlistDialog(open);
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="relative z-10 py-6 bg-gray-50 min-h-screen">
                    <div className="flex items-center border-b pb-6 px-6 gap-1 bg-white mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground">Loading your monitoring data...</p>
                        </div>
                        <div className="ml-auto">
                            <LoadingSpinner text="Loading..." />
                        </div>
                    </div>
                    <div className="px-6 space-y-6">
                        <SkeletonCard lines={3} />
                        <div className="grid gap-4 md:grid-cols-2">
                            <SkeletonCard lines={4} />
                            <SkeletonCard lines={4} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <SkeletonCard lines={4} />
                            <SkeletonCard lines={4} />
                            <SkeletonCard lines={4} />
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative z-10 bg-gray-50 min-h-screen">
                <DashboardContent
                    metrics={metrics}
                    chartData={chartData}
                    recentActivity={recentActivity}
                    monitorStatus={monitorStatus}
                    queueStatus={queueStatus}
                    isPolling={false}
                    dashboardData={dashboardData}
                    projectName={projectName}
                />
            </div>

            {/* Waitlist Dialog */}
            {user.waitlist_joined_at && (
                <WaitlistDialog
                    open={showWaitlistDialog}
                    onOpenChange={handleCloseWaitlistDialog}
                    user={{
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar,
                        waitlist_joined_at: user.waitlist_joined_at,
                    }}
                />
            )}
        </AppLayout>
    );
}