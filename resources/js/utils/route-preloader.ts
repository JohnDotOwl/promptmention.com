import { router } from '@inertiajs/react';

interface RoutePreloadConfig {
    currentRoute: string;
    nextLikelyRoutes: string[];
    priority: 'high' | 'medium' | 'low';
    delay?: number;
}

/**
 * Preload configuration based on common user navigation patterns
 */
const ROUTE_PRELOAD_MAP: Record<string, RoutePreloadConfig> = {
    // From dashboard, users typically go to monitors or analytics
    '/dashboard': {
        currentRoute: '/dashboard',
        nextLikelyRoutes: ['/monitors', '/analytics', '/prompts'],
        priority: 'high',
        delay: 1000
    },

    // From monitors, users typically go to specific monitor details or prompts
    '/monitors': {
        currentRoute: '/monitors',
        nextLikelyRoutes: ['/prompts', '/responses', '/citations'],
        priority: 'high',
        delay: 1500
    },

    // From analytics, users often check crawlers or go back to dashboard
    '/analytics': {
        currentRoute: '/analytics',
        nextLikelyRoutes: ['/crawlers', '/dashboard', '/monitors'],
        priority: 'medium',
        delay: 2000
    },

    // From prompts, users typically check responses
    '/prompts': {
        currentRoute: '/prompts',
        nextLikelyRoutes: ['/responses', '/citations', '/monitors'],
        priority: 'high',
        delay: 1000
    },

    // From responses, users often check citations
    '/responses': {
        currentRoute: '/responses',
        nextLikelyRoutes: ['/citations', '/prompts'],
        priority: 'high',
        delay: 1500
    },

    // From onboarding, users go to dashboard
    '/onboarding/step/3': {
        currentRoute: '/onboarding/step/3',
        nextLikelyRoutes: ['/dashboard', '/monitors'],
        priority: 'high',
        delay: 500
    }
};

/**
 * Intelligently preload likely next routes based on current page
 */
export function preloadLikelyRoutes(currentPath: string) {
    // Find matching route configuration
    const routeConfig = Object.values(ROUTE_PRELOAD_MAP).find(config =>
        currentPath.startsWith(config.currentRoute)
    );

    if (!routeConfig) return;

    const { nextLikelyRoutes, priority, delay = 1000 } = routeConfig;

    // Adjust delay based on priority
    const actualDelay = priority === 'high' ? delay :
                     priority === 'medium' ? delay * 1.5 :
                     delay * 2;

    setTimeout(() => {
        nextLikelyRoutes.forEach((route, index) => {
            // Stagger preloads to avoid overwhelming the browser
            setTimeout(() => {
                try {
                    router.prefetch(route, { method: 'get' });
                } catch (error) {
                    console.warn(`Failed to preload route: ${route}`, error);
                }
            }, index * 200);
        });
    }, actualDelay);
}

/**
 * Preload components when user is idle
 */
export function preloadOnIdle(routes: string[], maxRoutes = 3) {
    if (!('requestIdleCallback' in window)) {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            routes.slice(0, maxRoutes).forEach(route => {
                router.prefetch(route, { method: 'get' });
            });
        }, 2000);
        return;
    }

    let preloadedCount = 0;

    const preloadNext = () => {
        if (preloadedCount >= maxRoutes || preloadedCount >= routes.length) return;

        window.requestIdleCallback(() => {
            const route = routes[preloadedCount];
            if (route) {
                try {
                    router.prefetch(route, { method: 'get' });
                    preloadedCount++;

                    // Schedule next preload
                    if (preloadedCount < maxRoutes && preloadedCount < routes.length) {
                        setTimeout(preloadNext, 500);
                    }
                } catch (error) {
                    console.warn(`Failed to preload route during idle: ${route}`, error);
                }
            }
        });
    };

    preloadNext();
}

/**
 * Smart lazy loading criteria based on component complexity
 */
export function shouldLazyLoad(componentName: string): boolean {
    // Heavy components that should always be lazy loaded
    const heavyComponents = [
        'analytics',
        'dashboard',
        'crawlers',
        'settings/billing/usage',
        'responses-table', // Large table components
        'monitors/show'    // Detail pages with lots of data
    ];

    // Medium components - lazy load only if not likely to be visited soon
    const mediumComponents = [
        'prompts',
        'responses',
        'citations',
        'monitors'
    ];

    const componentLower = componentName.toLowerCase();

    // Always lazy load heavy components
    if (heavyComponents.some(heavy => componentLower.includes(heavy))) {
        return true;
    }

    // Conditionally lazy load medium components based on current route
    if (mediumComponents.some(medium => componentLower.includes(medium))) {
        const currentPath = window.location.pathname;
        const routeConfig = Object.values(ROUTE_PRELOAD_MAP).find(config =>
            currentPath.startsWith(config.currentRoute)
        );

        // Don't lazy load if it's a likely next route
        if (routeConfig) {
            const isLikelyNext = routeConfig.nextLikelyRoutes.some(route =>
                componentLower.includes(route.replace('/', ''))
            );
            return !isLikelyNext;
        }

        return true;
    }

    // Don't lazy load lightweight components
    return false;
}

/**
 * Initialize route-based preloading for the current page
 */
export function initializeRoutePreloading() {
    // Preload likely next routes after initial page load
    setTimeout(() => {
        preloadLikelyRoutes(window.location.pathname);
    }, 2000);

    // Set up idle preloading for common routes
    const commonRoutes = ['/dashboard', '/monitors', '/analytics', '/prompts'];
    preloadOnIdle(commonRoutes, 2);
}