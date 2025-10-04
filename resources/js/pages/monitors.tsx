import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MonitorCard } from '@/components/monitors/monitor-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Monitor, AlertCircle, RefreshCw, TrendingUp, Eye, MessageSquare, BarChart3 } from 'lucide-react';
import { type Monitor as MonitorType } from '@/types/monitor';

interface MonitorsPageProps {
    monitors: MonitorType[];
    error?: string;
}

export default function Monitors() {
    const { monitors, error } = usePage<MonitorsPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Monitors',
            href: '/monitors',
        },
    ];

    const handleRefresh = () => {
        window.location.reload();
    };

    // Calculate overall stats
    const totalMonitors = monitors?.length || 0;
    const activeMonitors = monitors?.filter(m => m.status === 'active').length || 0;
    const totalMentions = monitors?.reduce((sum, m) => sum + (m.stats?.mentions || 0), 0) || 0;
    const avgVisibility = monitors?.length > 0
        ? Math.round(monitors.reduce((sum, m) => sum + (m.stats?.visibilityScore || 0), 0) / monitors.length)
        : 0;

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Monitors" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Monitors
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage your brand monitoring setups
                            </p>
                        </div>
                        <Button onClick={handleRefresh} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Something went wrong
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                                {error || 'Unable to load monitors. Please try again.'}
                            </p>
                            <Button onClick={handleRefresh}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!monitors) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Monitors" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Monitors
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage your brand monitoring setups
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Loading monitors...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Please wait while we load your monitors.
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitors" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 lg:p-6">
                {/* Enhanced Header */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Monitors
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl font-light">
                                Track and analyze brand mentions across AI platforms
                            </p>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <Link href="/monitors/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Monitor
                            </Link>
                        </Button>
                    </div>

                    {/* Enhanced Quick Stats */}
                    {monitors && monitors.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <div className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-900/40 rounded-xl p-5 border border-blue-200/50 dark:border-blue-800/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Total Monitors</p>
                                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 tabular-nums">{totalMonitors}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-green-900/40 rounded-xl p-5 border border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Active</p>
                                        <p className="text-3xl font-bold text-green-900 dark:text-green-100 tabular-nums">{activeMonitors}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-purple-900/40 rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Total Mentions</p>
                                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 tabular-nums">{totalMentions.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-900/40 rounded-xl p-5 border border-orange-200/50 dark:border-orange-800/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Avg Visibility</p>
                                        <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 tabular-nums">{avgVisibility}%</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Content */}
                <div className="flex-1">
                    {monitors.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                            {monitors.map((monitor) => (
                                <MonitorCard
                                    key={monitor.id}
                                    monitor={monitor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <div className="text-center max-w-lg">
                                <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center mb-8">
                                    <Monitor className="h-16 w-16 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                    Start Monitoring Your Brand
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    Create your first monitor to track your brand's visibility across AI platforms.
                                    Get insights into your mentions, visibility scores, and citation rankings.
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What you'll get:</h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Real-time visibility tracking
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            Mention analytics across AI models
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            Citation rank monitoring
                                        </li>
                                    </ul>
                                </div>
                                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                                    <Link href="/monitors/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Monitor
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}