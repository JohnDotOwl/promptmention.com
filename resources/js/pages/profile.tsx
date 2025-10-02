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
  Globe,
  Building2,
  Mail,
  Briefcase,
  Flag,
  MapPin,
  Search,
  Star
} from 'lucide-react';
import { type ProfilePageProps } from '@/types/profile';

export default function Profile() {
    const { user, company, domainAnalysis, monitors, onboardingCompleted, hasData } = usePage<ProfilePageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Profile',
            href: '/profile',
        },
    ];

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
                    {hasData && (
                        <Button asChild variant="outline">
                            <Link href="/monitors/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Monitor
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Content */}
                {hasData ? (
                    <div className="space-y-6">
                        {/* User Information */}
                        {(user.firstName || user.lastName || user.jobRole) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {user.firstName && user.lastName && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                                                <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                                            </div>
                                        )}
                                        {user.jobRole && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Job Role</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4" />
                                                    {user.jobRole}
                                                </p>
                                            </div>
                                        )}
                                        {user.companySize && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company Size</label>
                                                <p className="text-lg font-semibold">{user.companySize}</p>
                                            </div>
                                        )}
                                        {user.language && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Language</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <Flag className="h-4 w-4" />
                                                    {user.language}
                                                </p>
                                            </div>
                                        )}
                                        {user.country && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Country</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {user.country}
                                                </p>
                                            </div>
                                        )}
                                        {user.email && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Company Information */}
                        {company.name && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Company Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company Name</label>
                                                <p className="text-xl font-bold">{company.name}</p>
                                            </div>
                                            {company.industry && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Industry</label>
                                                    <Badge variant="secondary" className="mt-1">
                                                        {company.industry}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        {company.website && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Website</label>
                                                <p className="text-lg font-semibold flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    <Link href={company.website} target="_blank" className="text-blue-600 hover:text-blue-800">
                                                        {company.website}
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                        {company.description && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                                                <p className="text-gray-700 dark:text-gray-300 mt-1">
                                                    {company.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Domain Analysis */}
                        {domainAnalysis && domainAnalysis.summary && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        Domain Analysis
                                        <Badge variant={domainAnalysis.status === 'completed' ? 'default' : 'secondary'}>
                                            {domainAnalysis.status}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Summary</label>
                                            <p className="text-gray-700 dark:text-gray-300 mt-1">
                                                {domainAnalysis.summary}
                                            </p>
                                        </div>
                                        {domainAnalysis.keywords && domainAnalysis.keywords.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Keywords</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {domainAnalysis.keywords.slice(0, 10).map((keyword, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {domainAnalysis.competitors && domainAnalysis.competitors.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Identified Competitors</label>
                                                <div className="mt-2">
                                                    <Link href="/competitors" className="text-blue-600 hover:text-blue-800">
                                                        View {domainAnalysis.competitors.length} competitors →
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Active Monitors */}
                        {monitors.length > 0 && (
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full"
                                                    asChild
                                                >
                                                    <Link href={`/monitors/${monitor.id}`}>
                                                        View Details →
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

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
                    /* Empty State - No Data */
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="text-center max-w-2xl">
                            <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                                <Monitor className="h-12 w-12 text-blue-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Set Up Your Brand Profile
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                To access your brand profile and manage your brand identity, you need to complete the onboarding process first.
                                This will collect information about your company and set up monitoring for your brand.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                                        <Building2 className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Company Info
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Add your company details
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
                                        <Search className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Domain Analysis
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        AI-powered website analysis
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-3">
                                        <Star className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Brand Profile
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Complete brand management
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
                                    <Link href="/monitors">
                                        View Monitors
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