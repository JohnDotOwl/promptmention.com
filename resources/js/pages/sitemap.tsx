import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Sitemap',
        href: '/sitemap',
    },
];

export default function Sitemap() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sitemap" />
            <div className="relative z-10 py-6">
                <div className="px-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Sitemap</CardTitle>
                            </div>
                            <CardDescription>
                                Manage your website's sitemap for better SEO and search engine indexing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p>Your sitemap helps search engines understand the structure of your website and discover all your important pages.</p>
                                </div>
                                
                                <div className="flex gap-4">
                                    <Button variant="outline">
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Sitemap XML
                                    </Button>
                                    <Button variant="outline">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Submit to Google
                                    </Button>
                                </div>

                                <div className="rounded-lg border p-4 bg-muted/50">
                                    <h3 className="font-medium mb-2">Sitemap Status</h3>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Updated:</span>
                                            <span>Not generated yet</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total URLs:</span>
                                            <span>0</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <span className="text-yellow-600">Pending</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-1">Coming Soon:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Automatic sitemap generation</li>
                                        <li>Custom URL priorities and frequencies</li>
                                        <li>Search engine submission integration</li>
                                        <li>Real-time sitemap updates</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}