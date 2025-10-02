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
  CheckCircle,
  Building2,
  Search,
  ExternalLink,
  Tag,
  Clock,
  Star
} from 'lucide-react';
import { type CompetitorsPageProps } from '@/types/competitors';

export default function Competitors() {
    const { user, competitors, stats, domainAnalysis, monitors, onboardingCompleted, hasData } = usePage<CompetitorsPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Competitors',
            href: '/competitors',
        },
    ];

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
                    {hasData && (
                        <Button asChild>
                            <Link href="/monitors/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Competitor
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Content */}
                {hasData ? (
                    <div className="space-y-6">
                        {/* Company Information */}
                        {user.company.name && (
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Your Company
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company Name</label>
                                            <p className="text-lg font-bold">{user.company.name}</p>
                                        </div>
                                        {user.company.industry && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Industry</label>
                                                <Badge variant="secondary" className="mt-1">
                                                    {user.company.industry}
                                                </Badge>
                                            </div>
                                        )}
                                        {user.company.website && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Website</label>
                                                <p className="text-sm font-semibold flex items-center gap-2 mt-1">
                                                    <Globe className="h-4 w-4" />
                                                    <Link href={user.company.website} target="_blank" className="text-blue-600 hover:text-blue-800">
                                                        {user.company.website}
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                    <div className="text-2xl font-bold">{stats.activeMonitors}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Tracking brand presence
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Competitors
                                    </CardTitle>
                                    <Swords className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalCompetitors}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Identified for tracking
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Monitor Competitors
                                    </CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalMonitorCompetitors}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Across all monitors
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Analysis Status
                                    </CardTitle>
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold flex items-center gap-2">
                                        <Badge variant={domainAnalysis?.status === 'completed' ? 'default' : 'secondary'}>
                                            {domainAnalysis?.status || 'Not Started'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Domain analysis
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Domain Analysis Summary */}
                        {domainAnalysis && domainAnalysis.summary && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        Domain Analysis Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {domainAnalysis.summary}
                                            </p>
                                        </div>
                                        {domainAnalysis.keywords && domainAnalysis.keywords.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Key Keywords</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {domainAnalysis.keywords.slice(0, 8).map((keyword, index) => (
                                                        <Badge key={index} variant="outline">
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {domainAnalysis.processedAt && (
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <Clock className="h-4 w-4 mr-1" />
                                                Analysis completed {new Date(domainAnalysis.processedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Competitors List */}
                        {competitors.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        Identified Competitors
                                    </h2>
                                    <Badge variant="outline" className="text-sm">
                                        {competitors.length} found
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {competitors.map((competitor, index) => (
                                        <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
                                            <CardHeader className="pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm group-hover:from-red-600 group-hover:to-orange-700 transition-colors">
                                                            {competitor.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-red-600 transition-colors">
                                                                {competitor.name}
                                                            </CardTitle>
                                                            {competitor.source && (
                                                                <Badge variant="secondary" className="text-xs mt-1">
                                                                    <Target className="h-3 w-3 mr-1" />
                                                                    {competitor.source === 'domain_analysis' ? 'AI Identified' : 'Monitor Added'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {competitor.industry && (
                                                    <Badge variant="outline" className="w-fit mt-2 border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/20">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {competitor.industry}
                                                    </Badge>
                                                )}
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="space-y-3">
                                                    {competitor.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {competitor.description}
                                                        </p>
                                                    )}

                                                    {competitor.website && (
                                                        <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Globe className="h-4 w-4 text-gray-500" />
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {competitor.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                                                                </span>
                                                            </div>
                                                            <Link
                                                                href={competitor.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                                                                title="Visit website"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {competitor.monitorName && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <Monitor className="h-3 w-3" />
                                                            From monitor: <span className="font-medium">{competitor.monitorName}</span>
                                                        </div>
                                                    )}

                                                    {/* Action buttons */}
                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 text-xs"
                                                            asChild
                                                        >
                                                            <Link href={`/monitors/create?competitor=${encodeURIComponent(competitor.name)}`}>
                                                                <Plus className="h-3 w-3 mr-1" />
                                                                Track
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex-1 text-xs"
                                                            asChild
                                                        >
                                                            <Link href={competitor.website} target="_blank">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                Analyze
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Your Monitors */}
                        {monitors.length > 0 && (
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
                                                    {monitor.competitorCount > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Competitors</span>
                                                            <span className="font-medium">{monitor.competitorCount}</span>
                                                        </div>
                                                    )}
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
                        )}

                        {/* Competitor Analysis Tools */}
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
                                        To enhance your competitor tracking, you can:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <li>Create additional brand monitors for different products</li>
                                        <li>Add competitor websites to your existing monitors</li>
                                        <li>Set up regular competitor analysis reports</li>
                                        <li>Track keyword performance against competitors</li>
                                    </ol>
                                    <Button className="mt-4" asChild>
                                        <Link href="/monitors/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create New Monitor
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Empty State - No Data */
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="text-center max-w-2xl">
                            <div className="mx-auto h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
                                <Swords className="h-12 w-12 text-red-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Start Competitor Analysis
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                To analyze competitors and track their performance, you need to complete the onboarding process first.
                                This will analyze your company and identify potential competitors in your industry.
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
                                    <Link href="/onboarding">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Start Onboarding
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/profile">
                                        View Profile
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