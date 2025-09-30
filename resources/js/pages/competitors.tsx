import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Swords,
  Target,
  TrendingUp,
  Users,
  Globe,
  BarChart3,
  Eye,
  Plus,
  Monitor,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { type Monitor as MonitorType } from '@/types/monitor';

interface CompetitorsPageProps {
    monitors?: MonitorType[];
}

export default function Competitors() {
    const { monitors = [] } = usePage<CompetitorsPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Competitors',
            href: '/competitors',
        },
    ];

    const hasMonitors = monitors && monitors.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Competitors" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Competitor Analysis
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track and analyze your competitors' performance across AI platforms
                        </p>
                    </div>
                    {hasMonitors && (
                        <Button asChild>
                            <Link href="/monitors/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Competitor
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Content */}
                {hasMonitors ? (
                    <div className="space-y-6">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Active Monitors
                                    </CardTitle>
                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{monitors.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Tracking brand presence
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Mentions
                                    </CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {monitors.reduce((sum, monitor) => sum + (monitor.stats?.mentions || 0), 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Across all platforms
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Visibility Score
                                    </CardTitle>
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {Math.round(monitors.reduce((sum, monitor) => sum + (monitor.stats?.visibilityScore || 0), 0) / monitors.length)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Average visibility
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Competitors
                                    </CardTitle>
                                    <Swords className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">0</div>
                                    <p className="text-xs text-muted-foreground">
                                        Added for tracking
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Your Monitors */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Your Brand Monitors
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
                                                    <span className="text-gray-600 dark:text-gray-400">Mentions</span>
                                                    <span className="font-medium">{monitor.stats?.mentions || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Visibility</span>
                                                    <span className="font-medium">{monitor.stats?.visibilityScore || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Responses</span>
                                                    <span className="font-medium">{monitor.stats?.totalResponses || 0}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full mt-3"
                                                    asChild
                                                >
                                                    <Link href={`/monitors/${monitor.id}`}>
                                                        Manage Monitor →
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Competitor Features */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Competitor Analysis Tools
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="text-center">
                                        <Target className="h-8 w-8 mx-auto mb-2 text-red-600" />
                                        <CardTitle className="text-sm">Competitor Tracking</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            Add and track competitor brands across AI platforms
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="text-center">
                                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                        <CardTitle className="text-sm">Market Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            Compare performance metrics and market share
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="text-center">
                                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                        <CardTitle className="text-sm">Insights</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            Get actionable insights from competitor data
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Getting Started */}
                        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                                    Get Started with Competitor Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        To start tracking competitors, you'll need to:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <li>Ensure you have active brand monitors</li>
                                        <li>Add competitor websites to track</li>
                                        <li>Set up comparison metrics</li>
                                        <li>Review regular reports and insights</li>
                                    </ol>
                                    <Button className="mt-4" asChild>
                                        <Link href="/monitors/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Competitor Monitor
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Empty State - No Monitors */
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="text-center max-w-2xl">
                            <div className="mx-auto h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
                                <Swords className="h-12 w-12 text-red-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Start Competitor Analysis
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                To analyze competitors and track their performance, you need to create monitors first.
                                Set up brand monitors to establish your baseline before tracking competitors.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                                        <Monitor className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Monitor Your Brand
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Establish your baseline metrics
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
                                        <Swords className="h-6 w-6 text-red-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Track Competitors
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Monitor competitor performance
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Gain Advantage
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Use insights to improve strategy
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
                                    <Link href="/profile">
                                        Learn About Brand Profiles
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