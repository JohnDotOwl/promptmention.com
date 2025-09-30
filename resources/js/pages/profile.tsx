import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  BarChart3,
  Settings,
  Plus,
  Monitor,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Globe
} from 'lucide-react';
import { type Monitor as MonitorType } from '@/types/monitor';

interface ProfilePageProps {
    monitors?: MonitorType[];
}

export default function Profile() {
    const { monitors = [] } = usePage<ProfilePageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Profile',
            href: '/profile',
        },
    ];

    const hasMonitors = monitors && monitors.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Brand Profile
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your brand identity and monitoring settings
                        </p>
                    </div>
                    {hasMonitors && (
                        <Button asChild variant="outline">
                            <Link href="/monitors/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Monitor
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Content */}
                {hasMonitors ? (
                    <div className="space-y-6">
                        {/* Active Monitors */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Active Monitors
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {monitors.slice(0, 4).map((monitor) => (
                                    <Card key={monitor.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">
                                                    {monitor.website.name}
                                                </CardTitle>
                                                <Badge variant={monitor.status === 'active' ? 'default' : 'secondary'}>
                                                    {monitor.status}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-sm">
                                                {monitor.website.url}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Visibility Score</span>
                                                    <span className="font-medium">{monitor.stats?.visibilityScore || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Total Mentions</span>
                                                    <span className="font-medium">{monitor.stats?.mentions || 0}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full mt-3"
                                                    asChild
                                                >
                                                    <Link href={`/monitors/${monitor.id}`}>
                                                        View Details →
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Profile Features */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Profile Management
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="text-center">
                                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                        <CardTitle className="text-sm">Personas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            Define your target audience personas
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="text-center">
                                        <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                        <CardTitle className="text-sm">Competitors</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            Track competitor analysis and insights
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="text-center">
                                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                                        <CardTitle className="text-sm">Analytics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            View brand performance metrics
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="text-center">
                                        <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                                        <CardTitle className="text-sm">Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            Configure monitoring preferences
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Empty State - No Monitors */
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="text-center max-w-2xl">
                            <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                                <Monitor className="h-12 w-12 text-blue-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Set Up Your First Monitor
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                To access your brand profile and manage your brand identity, you need to create a monitor first.
                                Monitors track your brand's presence across AI platforms and provide the data needed for profile management.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                                        <Globe className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Monitor Your Brand
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Track mentions across AI platforms
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Gain Insights
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Analyze your brand performance
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-3">
                                        <Users className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Build Profile
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Create comprehensive brand profiles
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg">
                                    <Link href="/monitors/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Monitor
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/monitors">
                                        View All Monitors
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}