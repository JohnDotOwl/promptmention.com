import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { useScrollManagement } from './hooks/use-scroll-management';
import React, { lazy, Suspense } from 'react';
import { LazyLoadingFallback } from './utils/lazy-load';
import { shouldLazyLoad, initializeRoutePreloading } from './utils/route-preloader';

const appName = import.meta.env.VITE_APP_NAME || 'PromptMention';

// App wrapper component that includes scroll management
function AppWrapper({ children }: { children: React.ReactNode }) {
    // Initialize scroll management with smart defaults
    useScrollManagement({
        scrollToTopOnRouteChange: true,
        restoreScrollPosition: true,
        scrollBehavior: 'smooth',
        scrollDelay: 100,
        excludeScrollToTop: [
            '/onboarding/*', // Don't scroll to top during onboarding steps
            '/auth/*'        // Don't scroll to top during auth flows
        ],
        excludeScrollRestore: [
            '/onboarding/*', // Don't restore scroll in onboarding (step-by-step flow)
        ]
    });

    return <>{children}</>;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        try {
            // Check if this component should be lazy loaded based on intelligent criteria
            const shouldUseLazyLoading = shouldLazyLoad(name);

            if (shouldUseLazyLoading) {
                // Use lazy loading for heavy components
                const LazyComponent = lazy(() =>
                    resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'))
                        .then(module => ({ default: (module as { default: React.ComponentType }).default }))
                );

                const WrappedComponent = (props: Record<string, unknown>) => (
                    <Suspense fallback={<LazyLoadingFallback />}>
                        <LazyComponent {...props} />
                    </Suspense>
                );

                return { default: WrappedComponent };
            } else {
                // Normal loading for lightweight components
                return await resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'));
            }
        } catch {
            console.warn(`Component not found: ./pages/${name}.tsx, falling back to 404 page`);
            // Fallback to 404 component
            const component = await resolvePageComponent(`./pages/errors/404.tsx`, import.meta.glob('./pages/**/*.tsx')) as { default: React.ComponentType };
            // Inject the 404 status as a prop
            const WrappedComponent = (props: Record<string, unknown>) => {
                const ErrorComponent = component.default;
                return <ErrorComponent {...props} />;
            };
            return { default: WrappedComponent };
        }
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AppWrapper>
                <App {...props} />
            </AppWrapper>
        );

        // Initialize intelligent route preloading
        initializeRoutePreloading();
    },
    progress: {
        color: '#538dfc',
        includeCSS: true,
        showSpinner: true,
        delay: 100,
    },
});

// This will set light / dark mode on load...
initializeTheme();