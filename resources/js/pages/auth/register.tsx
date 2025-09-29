import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    useEffect(() => {
        // Immediately redirect to Google OAuth
        window.location.href = route('auth.google');
    }, []);

    return (
        <AuthLayout title="Redirecting..." description="Please wait while we redirect you to Google">
            <Head title="Register" />
            <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                <p className="mt-4 text-sm text-muted-foreground">Redirecting to Google sign in...</p>
            </div>
        </AuthLayout>
    );
}
