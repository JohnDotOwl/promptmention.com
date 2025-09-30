import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MonitorCard } from '@/components/monitors/monitor-card';
import { Button } from '@/components/ui/button';
import { Plus, Monitor } from 'lucide-react';
import { type Monitor as MonitorType } from '@/types/monitor';

interface MonitorsPageProps {
    monitors: MonitorType[];
}

export default function Monitors() {
    const { auth } = usePage<SharedData>().props;
    const { monitors } = usePage<MonitorsPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Monitors',
            href: '/monitors',
        },
    ];

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
                    {monitors && monitors.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {monitors.map((monitor) => (
                                <MonitorCard
                                    key={monitor.id}
                                    monitor={monitor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <div className="text-center">
                                <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                                    <Monitor className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    No monitors yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                                    Get started by creating your first brand monitor to track your online presence across AI platforms.
                                </p>
                                <Button asChild size="lg">
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