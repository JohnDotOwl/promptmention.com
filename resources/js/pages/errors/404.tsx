import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <AppLayout>
            <Head title="Page Not Found" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto p-6">
                    <div className="text-center">
                        {/* 404 Illustration */}
                        <div className="mb-8">
                            <div className="relative inline-block">
                                <div className="text-9xl font-bold text-slate-200 dark:text-slate-700 select-none">
                                    404
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Search className="h-24 w-24 text-slate-400 dark:text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            Page Not Found
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                            The page you're looking for doesn't exist or has been moved.
                            Let's get you back on track.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="default"
                                className="flex items-center gap-2"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Go Back
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                href="/"
                            >
                                <Home className="h-4 w-4" />
                                Go Home
                            </Button>
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Looking for something specific? Try checking:
                            </p>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                                <li>• The URL spelling</li>
                                <li>• Your dashboard navigation</li>
                                <li>• The search functionality</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}