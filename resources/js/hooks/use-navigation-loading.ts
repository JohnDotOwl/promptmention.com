import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function useNavigationLoading() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

    useEffect(() => {
        const startHandler = (event: { detail: { visit: { url: string } } }) => {
            setIsLoading(true);
            setLoadingUrl(event.detail.visit.url);
        };

        const finishHandler = () => {
            setIsLoading(false);
            setLoadingUrl(null);
        };

        const cancelHandler = () => {
            setIsLoading(false);
            setLoadingUrl(null);
        };

        const errorHandler = () => {
            setIsLoading(false);
            setLoadingUrl(null);
        };

        document.addEventListener('inertia:start', startHandler);
        document.addEventListener('inertia:finish', finishHandler);
        document.addEventListener('inertia:cancel', cancelHandler);
        document.addEventListener('inertia:error', errorHandler);

        return () => {
            document.removeEventListener('inertia:start', startHandler);
            document.removeEventListener('inertia:finish', finishHandler);
            document.removeEventListener('inertia:cancel', cancelHandler);
            document.removeEventListener('inertia:error', errorHandler);
        };
    }, []);

    return { isLoading, loadingUrl };
}

export function useIsNavigatingTo(href: string) {
    const { isLoading, loadingUrl } = useNavigationLoading();

    return isLoading && loadingUrl === href;
}