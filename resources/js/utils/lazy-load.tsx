import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component for lazy loaded components
export function LazyLoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

// Wrapper function for lazy loading with automatic Suspense
export function lazyWithSuspense<T extends React.ComponentType>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ReactNode
) {
    const LazyComponent = lazy(importFn);

    return (props: React.ComponentProps<T>) => (
        <Suspense fallback={fallback || <LazyLoadingFallback />}>
            <LazyComponent {...props} />
        </Suspense>
    );
}

// Preload function to start loading a component before it's needed
export function preloadComponent(importFn: () => Promise<unknown>) {
    return importFn();
}