import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Swords,
  Target,
  TrendingUp,
  Globe,
  BarChart3,
  Eye,
  Plus,
  Monitor,
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
    const { user, competitors, stats, domainAnalysis, monitors, hasData } = usePage<CompetitorsPageProps>().props;

    // Helper function to validate website URLs
    const isValidWebsiteUrl = (url: string | null | undefined): boolean => {
        if (!url || typeof url !== 'string') return false;

        try {
            // Basic URL validation
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
        } catch {
            return false;
        }
    };

    // Helper function to extract domain from URL for favicon
    const extractDomainForFavicon = (url: string): string => {
        try {
            const urlObj = new URL(url);
            let domain = urlObj.hostname;

            // Remove www. prefix if present
            domain = domain.replace(/^www\./, '');

            return domain;
        } catch {
            return '';
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Competitors',
            href: '/competitors',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Competitors" />

            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/20">
                                <Swords className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Competitor Analysis
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-base pl-14">
                            Track and analyze your competitors' performance across AI platforms
                        </p>
                    </div>
                    {hasData && (
                        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
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
                            <Card className="border-t-4 border-t-orange-500 bg-gradient-to-br from-white to-orange-50/20 dark:from-gray-900 dark:to-orange-950/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl">
                                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                            <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
                                            Your Company
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-5">
                                        <div className="p-4 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-orange-100 dark:border-orange-900/30">
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
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Active Monitors
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <Monitor className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.activeMonitors}</div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                        Tracking brand presence
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Total Competitors
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <Swords className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalCompetitors}</div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                        Identified for tracking
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Monitor Competitors
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalMonitorCompetitors}</div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                        Across all monitors
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Analysis Status
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                            variant={domainAnalysis?.status === 'completed' ? 'default' : 'secondary'}
                                            className="text-sm font-semibold"
                                        >
                                            {domainAnalysis?.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                            {domainAnalysis?.status || 'Not Started'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                        Domain analysis
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Domain Analysis Summary */}
                        {domainAnalysis && domainAnalysis.summary && (
                            <Card className="border-t-4 border-t-purple-500 bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-900 dark:to-purple-950/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
                                            AI Domain Analysis
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-5">
                                        <div className="p-4 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-purple-100 dark:border-purple-900/30">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {domainAnalysis.summary}
                                            </p>
                                        </div>
                                        {domainAnalysis.keywords && domainAnalysis.keywords.length > 0 && (
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                                                    Key Keywords & Topics
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {domainAnalysis.keywords.slice(0, 10).map((keyword, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="px-3 py-1.5 border-purple-200 bg-purple-50/50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300 font-medium hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                                                        >
                                                            <Tag className="h-3.5 w-3.5 mr-1.5" />
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {domainAnalysis.processedAt && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <Clock className="h-4 w-4" />
                                                <span className="font-medium">
                                                    Analysis completed on {new Date(domainAnalysis.processedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Competitors List */}
                        {competitors.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            Identified Competitors
                                        </h2>
                                        <Badge variant="default" className="text-sm px-3 py-1">
                                            {competitors.length} found
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {competitors.filter(competitor => competitor.name && competitor.name !== 'Unknown' && competitor.name.trim() !== '').map((competitor, index) => (
                                        <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-2 hover:border-red-200 dark:hover:border-red-900">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-300" />

                                            <CardHeader className="pb-4 relative z-10">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200 overflow-hidden">
                                                            {competitor.website && isValidWebsiteUrl(competitor.website) && (
                                                                <>
                                                                    <img
                                                                        src={`https://www.google.com/s2/favicons?domain=${extractDomainForFavicon(competitor.website)}&sz=256`}
                                                                        alt={`${competitor.name || 'Competitor'} favicon`}
                                                                        className="w-full h-full object-cover rounded-xl"
                                                                        onError={(e) => {
                                                                            // Fallback to initials if favicon fails to load
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                            const fallback = target.nextElementSibling as HTMLDivElement;
                                                                            if (fallback) fallback.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg bg-gray-100 dark:bg-gray-800 rounded-xl" style={{ display: 'none' }}>
                                                                        {(competitor.name && competitor.name.length > 0) ? competitor.name.charAt(0).toUpperCase() : '?'}
                                                                    </div>
                                                                </>
                                                            )}
                                                            {(!competitor.website || !isValidWebsiteUrl(competitor.website)) && (
                                                                <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg bg-gray-100 dark:bg-gray-800 rounded-xl">
                                                                    {(competitor.name && competitor.name.length > 0) ? competitor.name.charAt(0).toUpperCase() : '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-1.5 truncate">
                                                                {competitor.name || 'Unknown'}
                                                            </CardTitle>
                                                            {competitor.source && (
                                                                <Badge
                                                                    variant={competitor.source === 'domain_analysis' ? 'default' : 'secondary'}
                                                                    className="text-xs font-medium"
                                                                >
                                                                    {competitor.source === 'domain_analysis' ? (
                                                                        <>
                                                                            <Star className="h-3 w-3 mr-1 fill-current" />
                                                                            AI Identified
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Target className="h-3 w-3 mr-1" />
                                                                            Manual
                                                                        </>
                                                                    )}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {competitor.industry && (
                                                    <Badge variant="outline" className="w-fit border-blue-300 text-blue-700 bg-blue-50/80 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/30 font-medium">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {competitor.industry}
                                                    </Badge>
                                                )}
                                            </CardHeader>
                                            <CardContent className="pt-0 relative z-10">
                                                <div className="space-y-4">
                                                    {competitor.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                                            {competitor.description}
                                                        </p>
                                                    )}

                                                    {competitor.website && isValidWebsiteUrl(competitor.website) && (
                                                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 group-hover:from-gray-100 group-hover:to-gray-50 dark:group-hover:from-gray-800 dark:group-hover:to-gray-800/50 transition-all border border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                                                                <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                                                                    {competitor.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                                                                </span>
                                                            </div>
                                                            <Link
                                                                href={competitor.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors flex-shrink-0"
                                                                title="Visit website"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {competitor.monitorName && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/30 px-2.5 py-1.5 rounded-md">
                                                            <Monitor className="h-3.5 w-3.5" />
                                                            From: <span className="font-semibold text-gray-700 dark:text-gray-300">{competitor.monitorName}</span>
                                                        </div>
                                                    )}

                                                    {/* Action buttons */}
                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="flex-1 font-semibold shadow-sm hover:shadow-md transition-all"
                                                            asChild
                                                        >
                                                            <Link href={`/monitors/create?competitor=${encodeURIComponent(competitor.name || 'Unknown')}`}>
                                                                <Plus className="h-4 w-4 mr-1.5" />
                                                                Track
                                                            </Link>
                                                        </Button>
                                                              <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            asChild={competitor.website && isValidWebsiteUrl(competitor.website)}
                                                            disabled={!competitor.website || !isValidWebsiteUrl(competitor.website)}
                                                        >
                                                            {competitor.website && isValidWebsiteUrl(competitor.website) ? (
                                                                <Link href={competitor.website} target="_blank" rel="noopener noreferrer">
                                                                    <Eye className="h-4 w-4 mr-1.5" />
                                                                    Visit
                                                                </Link>
                                                            ) : (
                                                                <>
                                                                    <Eye className="h-4 w-4 mr-1.5" />
                                                                    No Website
                                                                </>
                                                            )}
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
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                                        <Monitor className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Your Brand Monitors
                                    </h2>
                                    <Badge variant="default" className="text-sm px-3 py-1">
                                        {monitors.length} active
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {monitors.slice(0, 4).map((monitor) => (
                                        <Card key={monitor.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-2 hover:border-blue-200 dark:hover:border-blue-900">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-300" />

                                            <CardHeader className="pb-4 relative z-10">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200 overflow-hidden">
                                                            <img
                                                                src={`https://www.google.com/s2/favicons?domain=${extractDomainForFavicon(monitor.website.url)}&sz=256`}
                                                                alt={`${monitor.website.name} favicon`}
                                                                className="w-full h-full object-cover rounded-xl"
                                                                onError={(e) => {
                                                                    // Fallback to initials if favicon fails to load
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const fallback = target.nextElementSibling as HTMLDivElement;
                                                                    if (fallback) fallback.style.display = 'flex';
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg bg-gray-100 dark:bg-gray-800 rounded-xl" style={{ display: 'none' }}>
                                                                {(monitor.website.name && monitor.website.name.length > 0) ? monitor.website.name.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5 truncate">
                                                                {monitor.website.name}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant={monitor.status === 'active' ? 'default' : 'secondary'}
                                                                    className="text-xs font-medium"
                                                                >
                                                                    {monitor.status === 'active' && <CheckCircle className="h-3 w-3 mr-1 fill-current" />}
                                                                    {monitor.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 group-hover:from-gray-100 group-hover:to-gray-50 dark:group-hover:from-gray-800 dark:group-hover:to-gray-800/50 transition-all border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                                                        <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                                                            {monitor.website.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0 relative z-10">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {monitor.competitorCount > 0 && (
                                                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Swords className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Competitors</span>
                                                                </div>
                                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{monitor.competitorCount}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="flex-1 font-semibold shadow-sm hover:shadow-md transition-all"
                                                            asChild
                                                        >
                                                            <Link href={`/monitors/${monitor.id}`}>
                                                                <Eye className="h-4 w-4 mr-1.5" />
                                                                Manage
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            asChild
                                                        >
                                                            <Link href={monitor.website.url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-4 w-4" />
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
                        <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-indigo-950/20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-blue-900 dark:text-blue-100">Next Steps in Competitor Analysis</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="space-y-4">
                                    <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                                        Maximize your competitive advantage with these strategies:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex gap-3 p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                1
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Create additional brand monitors for different products
                                            </p>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                2
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Add competitor websites to your existing monitors
                                            </p>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                3
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Set up regular competitor analysis reports
                                            </p>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                4
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Track keyword performance against competitors
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="lg" className="mt-4 shadow-md hover:shadow-lg transition-shadow" asChild>
                                        <Link href="/monitors/create">
                                            <Plus className="h-5 w-5 mr-2" />
                                            Create New Monitor
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Empty State - No Data */
                    <div className="flex flex-col items-center justify-center h-full py-16">
                        <div className="text-center max-w-3xl px-6">
                            <div className="relative inline-block mb-8">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                                <div className="relative mx-auto h-28 w-28 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
                                    <Swords className="h-14 w-14 text-white" />
                                </div>
                            </div>

                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Start Your Competitive Analysis Journey
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
                                Complete onboarding to unlock AI-powered competitor analysis. We'll analyze your company and identify key competitors in your industry.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="group p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200">
                                    <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                        <Monitor className="h-7 w-7 text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                                        Monitor Your Brand
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Establish your baseline metrics and track brand presence
                                    </p>
                                </div>

                                <div className="group p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200">
                                    <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                        <Swords className="h-7 w-7 text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                                        Track Competitors
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Monitor competitor performance across platforms
                                    </p>
                                </div>

                                <div className="group p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200">
                                    <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                        <TrendingUp className="h-7 w-7 text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                                        Gain Competitive Edge
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Use AI insights to improve your strategy
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                                    <Link href="/onboarding">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Start Onboarding
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <Link href="/profile">
                                        <Building2 className="h-5 w-5 mr-2" />
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