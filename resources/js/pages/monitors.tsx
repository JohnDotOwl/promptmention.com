import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MonitorCard } from '@/components/monitors/monitor-card';
import { Button } from '@/components/ui/button';
import { Plus, Monitor, AlertCircle, RefreshCw } from 'lucide-react';
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

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Monitors
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your brand monitoring setups
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/monitors/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Monitor
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {monitors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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