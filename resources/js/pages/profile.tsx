import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Users,
  Building2,
  Mail,
  Briefcase,
  Flag,
  MapPin,
  Search,
  Globe,
  Edit2,
  Save,
  X,
  TrendingUp,
  Activity,
  Sparkles,
  Target,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { type ProfilePageProps } from '@/types/profile';
import { useState } from 'react';

export default function Profile() {
    const { user, company, domainAnalysis, monitors, onboardingCompleted, hasData } = usePage<ProfilePageProps>().props;

    const [editingField, setEditingField] = useState<string | null>(null);

    // Personal info form
    const personalForm = useForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        jobRole: user.jobRole || '',
        companySize: user.companySize || '',
        language: user.language || '',
        country: user.country || '',
    });

    // Company info form
    const companyForm = useForm({
        companyName: company.name || '',
        companyWebsite: company.website || '',
        companyDescription: company.description || '',
        industry: company.industry || '',
    });

    // Domain analysis form
    const domainForm = useForm({
        domainSummary: domainAnalysis?.summary || '',
        keywords: domainAnalysis?.keywords || [],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Brand Profile',
            href: '/profile',
        },
    ];

    const handlePersonalSave = () => {
        personalForm.patch(route('brand-profile.update'), {
            onSuccess: () => {
                setEditingField(null);
            },
        });
    };

    const handleCompanySave = () => {
        companyForm.patch(route('brand-profile.update'), {
            onSuccess: () => {
                setEditingField(null);
            },
        });
    };

    const handleDomainSave = () => {
        domainForm.patch(route('brand-profile.update'), {
            onSuccess: () => {
                setEditingField(null);
            },
        });
    };

    const cancelEdit = () => {
        setEditingField(null);
        personalForm.reset();
        companyForm.reset();
        domainForm.reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brand Profile" />

            <div className="flex h-full flex-1 flex-col gap-8 p-6">
                {hasData ? (
                    <>
                        {/* Hero Section with Brand Identity */}
                        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                {/* Brand Identity */}
                                <div className="flex items-center gap-6">
                                    {/* Company Logo */}
                                    <div className="h-20 w-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-700">
                                        <Building2 className="h-10 w-10 text-gray-600 dark:text-gray-400" />
                                    </div>

                                    {/* Brand Name & Details */}
                                    <div>
                                        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                                            {company.name || 'Your Brand'}
                                        </h1>
                                        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                                            {company.industry && (
                                                <Badge variant="outline" className="text-sm">
                                                    {company.industry}
                                                </Badge>
                                            )}
                                            {company.website && (
                                                <a
                                                    href={company.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                    <span className="text-sm">{company.website}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-900 min-w-[100px] text-center">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Monitors</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{monitors.length}</p>
                                    </div>

                                    {domainAnalysis?.keywords && (
                                        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-900 min-w-[100px] text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Keywords</span>
                                            </div>
                                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{domainAnalysis.keywords.length}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Personal & Company */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information */}
                                <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-blue-600" />
                                                Personal Information
                                            </CardTitle>
                                            {editingField !== 'personal' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingField('personal')}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {editingField === 'personal' ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="firstName">First Name</Label>
                                                        <Input
                                                            id="firstName"
                                                            value={personalForm.data.firstName}
                                                            onChange={(e) => personalForm.setData('firstName', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="lastName">Last Name</Label>
                                                        <Input
                                                            id="lastName"
                                                            value={personalForm.data.lastName}
                                                            onChange={(e) => personalForm.setData('lastName', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="jobRole">Job Role</Label>
                                                        <Input
                                                            id="jobRole"
                                                            value={personalForm.data.jobRole}
                                                            onChange={(e) => personalForm.setData('jobRole', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="companySize">Company Size</Label>
                                                        <Input
                                                            id="companySize"
                                                            value={personalForm.data.companySize}
                                                            onChange={(e) => personalForm.setData('companySize', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="language">Language</Label>
                                                        <Input
                                                            id="language"
                                                            value={personalForm.data.language}
                                                            onChange={(e) => personalForm.setData('language', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="country">Country</Label>
                                                        <Input
                                                            id="country"
                                                            value={personalForm.data.country}
                                                            onChange={(e) => personalForm.setData('country', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        disabled={personalForm.processing}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handlePersonalSave}
                                                        disabled={personalForm.processing}
                                                    >
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {user.firstName && user.lastName && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Full Name</p>
                                                        <p className="text-base font-semibold">{user.firstName} {user.lastName}</p>
                                                    </div>
                                                )}
                                                {user.email && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Email</p>
                                                        <p className="text-base font-semibold flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-blue-600" />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                )}
                                                {user.jobRole && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Job Role</p>
                                                        <p className="text-base font-semibold flex items-center gap-2">
                                                            <Briefcase className="h-4 w-4 text-blue-600" />
                                                            {user.jobRole}
                                                        </p>
                                                    </div>
                                                )}
                                                {user.companySize && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Company Size</p>
                                                        <p className="text-base font-semibold">{user.companySize}</p>
                                                    </div>
                                                )}
                                                {user.language && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Language</p>
                                                        <p className="text-base font-semibold flex items-center gap-2">
                                                            <Flag className="h-4 w-4 text-blue-600" />
                                                            {user.language}
                                                        </p>
                                                    </div>
                                                )}
                                                {user.country && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Country</p>
                                                        <p className="text-base font-semibold flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-blue-600" />
                                                            {user.country}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Company Information */}
                                <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Building2 className="h-5 w-5 text-purple-600" />
                                                Company Information
                                            </CardTitle>
                                            {editingField !== 'company' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingField('company')}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {editingField === 'company' ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="companyName">Company Name</Label>
                                                        <Input
                                                            id="companyName"
                                                            value={companyForm.data.companyName}
                                                            onChange={(e) => companyForm.setData('companyName', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="industry">Industry</Label>
                                                        <Input
                                                            id="industry"
                                                            value={companyForm.data.industry}
                                                            onChange={(e) => companyForm.setData('industry', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="companyWebsite">Website</Label>
                                                    <Input
                                                        id="companyWebsite"
                                                        type="url"
                                                        value={companyForm.data.companyWebsite}
                                                        onChange={(e) => companyForm.setData('companyWebsite', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="companyDescription">Description</Label>
                                                    <Textarea
                                                        id="companyDescription"
                                                        value={companyForm.data.companyDescription}
                                                        onChange={(e) => companyForm.setData('companyDescription', e.target.value)}
                                                        rows={4}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="flex gap-2 justify-end pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        disabled={companyForm.processing}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleCompanySave}
                                                        disabled={companyForm.processing}
                                                    >
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {company.name && (
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">Company Name</p>
                                                            <p className="text-xl font-bold">{company.name}</p>
                                                        </div>
                                                    )}
                                                    {company.industry && (
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-muted-foreground">Industry</p>
                                                            <Badge variant="secondary" className="mt-1">
                                                                {company.industry}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                {company.website && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Website</p>
                                                        <a
                                                            href={company.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-base font-semibold flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                                        >
                                                            <Globe className="h-4 w-4" />
                                                            {company.website}
                                                        </a>
                                                    </div>
                                                )}
                                                {company.description && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Description</p>
                                                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                                                            {company.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Brand Intelligence */}
                                {domainAnalysis && domainAnalysis.summary && (
                                    <Card className="border-2 hover:border-green-200 dark:hover:border-green-900 transition-colors">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Sparkles className="h-5 w-5 text-green-600" />
                                                    AI-Powered Brand Intelligence
                                                    <Badge variant="outline" className="ml-2">
                                                        {domainAnalysis.status}
                                                    </Badge>
                                                </CardTitle>
                                                {editingField !== 'domain' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingField('domain')}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {editingField === 'domain' ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="domainSummary">Summary</Label>
                                                        <Textarea
                                                            id="domainSummary"
                                                            value={domainForm.data.domainSummary}
                                                            onChange={(e) => domainForm.setData('domainSummary', e.target.value)}
                                                            rows={6}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                                                        <Input
                                                            id="keywords"
                                                            value={domainForm.data.keywords.join(', ')}
                                                            onChange={(e) => domainForm.setData('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                                                            placeholder="keyword1, keyword2, keyword3"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 justify-end pt-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={cancelEdit}
                                                            disabled={domainForm.processing}
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={handleDomainSave}
                                                            disabled={domainForm.processing}
                                                        >
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4" />
                                                            Domain Summary
                                                        </p>
                                                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                                                            {domainAnalysis.summary}
                                                        </p>
                                                    </div>

                                                    {domainAnalysis.keywords && domainAnalysis.keywords.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <Search className="h-4 w-4" />
                                                                Keywords ({domainAnalysis.keywords.length})
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {domainAnalysis.keywords.map((keyword, index) => (
                                                                    <Badge
                                                                        key={index}
                                                                        variant="outline"
                                                                        className="text-sm"
                                                                    >
                                                                        {keyword}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {domainAnalysis.competitors && domainAnalysis.competitors.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <BarChart3 className="h-4 w-4" />
                                                                Competitors
                                                            </p>
                                                            <Button variant="outline" className="w-full" asChild>
                                                                <Link href="/competitors">
                                                                    View {domainAnalysis.competitors.length} Competitors →
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Right Column - Monitors & Status */}
                            <div className="space-y-6">
                                {/* Profile Status */}
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-base">Profile Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                                            <span className="text-sm font-medium">Profile</span>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-semibold text-green-600">Complete</span>
                                            </div>
                                        </div>

                                        {onboardingCompleted && (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                                                <span className="text-sm font-medium">Onboarding</span>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-semibold text-blue-600">Complete</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Active Monitors */}
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            Active Monitors
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {monitors.length > 0 ? (
                                            <div className="space-y-3">
                                                {monitors.slice(0, 3).map((monitor) => (
                                                    <div
                                                        key={monitor.id}
                                                        className="p-3 rounded-lg border hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <p className="font-semibold text-sm">{monitor.website.name}</p>
                                                            <Badge
                                                                variant={monitor.status === 'active' ? 'default' : 'secondary'}
                                                                className="text-xs"
                                                            >
                                                                {monitor.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-2">{monitor.website.url}</p>
                                                        <Button variant="ghost" size="sm" className="w-full h-8 text-xs" asChild>
                                                            <Link href={`/monitors/${monitor.id}`}>
                                                                View Details →
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                ))}
                                                {monitors.length > 3 && (
                                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                                        <Link href="/monitors">
                                                            View All {monitors.length} Monitors →
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground mb-3">No monitors yet</p>
                                                <Button size="sm" asChild>
                                                    <Link href="/monitors/create">Create Monitor</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full p-12">
                        <div className="text-center max-w-2xl">
                            <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-10 w-10 text-blue-600" />
                            </div>

                            <h3 className="text-3xl font-bold mb-4">
                                Set Up Your Brand Profile
                            </h3>

                            <p className="text-muted-foreground mb-8 text-lg">
                                Complete onboarding to unlock your brand profile and start tracking mentions
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 rounded-xl border-2">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mb-3">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Company Info</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Add your company details
                                    </p>
                                </div>

                                <div className="text-center p-6 rounded-xl border-2">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mb-3">
                                        <Search className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold mb-1">AI Analysis</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Get AI-powered insights
                                    </p>
                                </div>

                                <div className="text-center p-6 rounded-xl border-2">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mb-3">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Brand Profile</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your brand identity
                                    </p>
                                </div>
                            </div>

                            <Button size="lg" asChild>
                                <Link href="/onboarding">
                                    Start Onboarding →
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
