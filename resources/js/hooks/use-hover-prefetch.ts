import { router } from '@inertiajs/react';
import { useCallback, useRef } from 'react';

interface HoverPrefetchOptions {
  /**
   * Delay in ms before prefetching on hover
   * @default 75 (reduced from 150ms for faster UX)
   */
  hoverDelay?: number;
  /**
   * Whether to prefetch immediately on mouseenter
   * @default false
   */
  immediate?: boolean;
  /**
   * Whether to prefetch on focus (keyboard navigation)
   * @default true
   */
  prefetchOnFocus?: boolean;
  /**
   * Enable smart hover detection that prefetches on cursor slowdown
   * @default true
   */
  smartHover?: boolean;
  /**
   * Minimum mouse movement speed (px/ms) to trigger smart prefetch
   * @default 0.5
   */
  slowdownThreshold?: number;
  /**
   * Priority level affecting prefetch timing
   * @default 'medium'
   */
  priority?: 'high' | 'medium' | 'low';
  /**
   * Prefetch options to pass to Inertia
   */
  prefetchOptions?: {
    onlyKeys?: string[];
    headers?: Record<string, string>;
  };
}

/**
 * Hook for implementing hover-based prefetching
 */
export function useHoverPrefetch(href: string, options: HoverPrefetchOptions = {}) {
  const {
    hoverDelay: customDelay,
    immediate = false,
    prefetchOnFocus = true,
    smartHover = true,
    slowdownThreshold = 0.5,
    priority = 'medium',
    prefetchOptions = {}
  } = options;

  // Priority-based timing (reduced from original values)
  const priorityDelays = {
    high: 25,    // Critical navigation elements
    medium: 75,  // Standard links (reduced from 150)
    low: 150     // Less important links
  };

  const hoverDelay = customDelay ?? priorityDelays[priority];

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef<boolean>(false);
  const mousePositionRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const smartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefetchPage = useCallback(() => {
    if (prefetchedRef.current) return;

    try {
      router.prefetch(href, {
        method: 'get',
        ...prefetchOptions
      });
      prefetchedRef.current = true;
    } catch (error) {
      console.warn('Failed to prefetch:', href, error);
    }
  }, [href, prefetchOptions]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!smartHover || prefetchedRef.current) return;

    const currentTime = Date.now();
    const currentPosition = { x: event.clientX, y: event.clientY, time: currentTime };

    if (mousePositionRef.current) {
      const timeDiff = currentTime - mousePositionRef.current.time;
      const distance = Math.sqrt(
        Math.pow(currentPosition.x - mousePositionRef.current.x, 2) +
        Math.pow(currentPosition.y - mousePositionRef.current.y, 2)
      );

      const speed = timeDiff > 0 ? distance / timeDiff : 0;

      // If mouse is moving slowly (indicating consideration), prefetch faster
      if (speed < slowdownThreshold && timeDiff > 100) {
        if (smartTimeoutRef.current) {
          clearTimeout(smartTimeoutRef.current);
        }
        // Reduce delay for slow movement (user is considering the link)
        smartTimeoutRef.current = setTimeout(prefetchPage, Math.max(25, hoverDelay * 0.3));
      }
    }

    mousePositionRef.current = currentPosition;
  }, [smartHover, slowdownThreshold, prefetchPage, hoverDelay]);

  const handleMouseEnter = useCallback((event?: React.MouseEvent) => {
    if (prefetchedRef.current) return;

    // Set up mouse move tracking for smart hover
    if (smartHover && event?.currentTarget) {
      const element = event.currentTarget as HTMLElement;
      element.addEventListener('mousemove', handleMouseMove as EventListener);

      // Clean up on mouse leave
      const cleanup = () => {
        element.removeEventListener('mousemove', handleMouseMove as EventListener);
        mousePositionRef.current = null;
        if (smartTimeoutRef.current) {
          clearTimeout(smartTimeoutRef.current);
          smartTimeoutRef.current = null;
        }
      };

      element.addEventListener('mouseleave', cleanup, { once: true });
    }

    if (immediate) {
      prefetchPage();
    } else {
      timeoutRef.current = setTimeout(prefetchPage, hoverDelay);
    }
  }, [prefetchPage, immediate, hoverDelay, smartHover, handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (smartTimeoutRef.current) {
      clearTimeout(smartTimeoutRef.current);
      smartTimeoutRef.current = null;
    }
  }, []);

  const handleFocus = useCallback(() => {
    if (prefetchOnFocus && !prefetchedRef.current) {
      prefetchPage();
    }
  }, [prefetchPage, prefetchOnFocus]);

  // Reset prefetched state when href changes
  const resetPrefetchState = useCallback(() => {
    prefetchedRef.current = false;
  }, []);

  // Return event handlers and utility functions
  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    prefetch: prefetchPage,
    resetPrefetchState,
    isPrefetched: prefetchedRef.current
  };
}

/**
 * Enhanced Link component with hover prefetching
 */
export interface HoverLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  hoverDelay?: number;
  immediate?: boolean;
  prefetchOnFocus?: boolean;
  prefetchOptions?: {
    onlyKeys?: string[];
    headers?: Record<string, string>;
  };
  [key: string]: any;
}

/**
 * Props for creating enhanced links with hover prefetching
 */
export function getHoverLinkProps(href: string, options: HoverPrefetchOptions = {}) {
  const { onMouseEnter, onMouseLeave, onFocus } = useHoverPrefetch(href, options);

  return {
    onMouseEnter,
    onMouseLeave,
    onFocus
  };
}

/**
 * Utility to preload components for likely navigation paths
 */
export function preloadRouteComponents(routes: string[]) {
  routes.forEach(route => {
    router.prefetch(route, { method: 'get' });
  });
}

/**
 * Hook for bulk preloading common routes
 */
export function useRoutePreloader() {
  const preloadDashboardRoutes = useCallback(() => {
    preloadRouteComponents([
      '/dashboard',
      '/monitors',
      '/analytics'
    ]);
  }, []);

  const preloadMonitoringRoutes = useCallback(() => {
    preloadRouteComponents([
      '/monitors',
      '/prompts',
      '/responses',
      '/citations'
    ]);
  }, []);

  const preloadAnalyticsRoutes = useCallback(() => {
    preloadRouteComponents([
      '/analytics',
      '/crawlers'
    ]);
  }, []);

  return {
    preloadDashboardRoutes,
    preloadMonitoringRoutes,
    preloadAnalyticsRoutes
  };
}