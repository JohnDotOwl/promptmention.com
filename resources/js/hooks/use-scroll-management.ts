import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface ScrollManagementOptions {
  /**
   * Enable automatic scroll-to-top on route changes
   * @default true
   */
  scrollToTopOnRouteChange?: boolean;
  /**
   * Enable scroll position restoration on back navigation
   * @default true
   */
  restoreScrollPosition?: boolean;
  /**
   * Scroll behavior for scroll-to-top
   * @default 'smooth'
   */
  scrollBehavior?: ScrollBehavior;
  /**
   * Delay before scrolling to top (allows for page transitions)
   * @default 100
   */
  scrollDelay?: number;
  /**
   * Maximum age for stored scroll positions (in minutes)
   * @default 30
   */
  maxScrollAge?: number;
  /**
   * Element to scroll (defaults to window)
   */
  scrollElement?: HTMLElement | null;
  /**
   * Routes that should not scroll to top automatically
   */
  excludeScrollToTop?: string[];
  /**
   * Routes that should not restore scroll position
   */
  excludeScrollRestore?: string[];
}

/**
 * Key for storing scroll positions in sessionStorage
 */
const SCROLL_POSITIONS_KEY = 'inertia_scroll_positions';

/**
 * Get stored scroll positions from sessionStorage
 */
function getStoredScrollPositions(): Record<string, ScrollPosition> {
  try {
    const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
    if (!stored) return {};

    const positions = JSON.parse(stored);
    const now = Date.now();

    // Filter out old positions
    const filtered: Record<string, ScrollPosition> = {};
    Object.entries(positions).forEach(([key, pos]: [string, any]) => {
      if (pos.timestamp && now - pos.timestamp < 30 * 60 * 1000) { // 30 minutes
        filtered[key] = pos;
      }
    });

    return filtered;
  } catch {
    return {};
  }
}

/**
 * Store scroll position in sessionStorage
 */
function storeScrollPosition(url: string, position: ScrollPosition) {
  try {
    const positions = getStoredScrollPositions();
    positions[url] = position;
    sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
  } catch (error) {
    console.warn('Failed to store scroll position:', error);
  }
}

/**
 * Get scroll position for element or window
 */
function getScrollPosition(element?: HTMLElement | null): ScrollPosition {
  if (element) {
    return {
      x: element.scrollLeft,
      y: element.scrollTop,
      timestamp: Date.now()
    };
  }

  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset,
    timestamp: Date.now()
  };
}

/**
 * Set scroll position for element or window
 */
function setScrollPosition(
  position: ScrollPosition,
  element?: HTMLElement | null,
  behavior: ScrollBehavior = 'auto'
) {
  if (element) {
    element.scrollTo({
      left: position.x,
      top: position.y,
      behavior
    });
  } else {
    window.scrollTo({
      left: position.x,
      top: position.y,
      behavior
    });
  }
}

/**
 * Hook for managing scroll behavior with InertiaJS
 */
export function useScrollManagement(options: ScrollManagementOptions = {}) {
  const {
    scrollToTopOnRouteChange = true,
    restoreScrollPosition = true,
    scrollBehavior = 'smooth',
    scrollDelay = 100,
    maxScrollAge = 30,
    scrollElement,
    excludeScrollToTop = [],
    excludeScrollRestore = []
  } = options;

  const currentUrl = useRef<string>('');
  const isBackNavigation = useRef<boolean>(false);
  const restoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if route should be excluded from scroll behavior
  const shouldExcludeScrollToTop = useCallback((url: string) => {
    return excludeScrollToTop.some(pattern =>
      new RegExp(pattern.replace(/\*/g, '.*')).test(url)
    );
  }, [excludeScrollToTop]);

  const shouldExcludeScrollRestore = useCallback((url: string) => {
    return excludeScrollRestore.some(pattern =>
      new RegExp(pattern.replace(/\*/g, '.*')).test(url)
    );
  }, [excludeScrollRestore]);

  // Scroll to top
  const scrollToTop = useCallback((immediate = false) => {
    const behavior = immediate ? 'auto' : scrollBehavior;

    if (scrollElement) {
      scrollElement.scrollTo({ top: 0, left: 0, behavior });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior });
    }
  }, [scrollElement, scrollBehavior]);

  // Restore scroll position
  const restoreScrollForUrl = useCallback((url: string) => {
    if (shouldExcludeScrollRestore(url)) return;

    const positions = getStoredScrollPositions();
    const position = positions[url];

    if (position) {
      // Use a timeout to allow the page to render first
      const timeoutId = setTimeout(() => {
        setScrollPosition(position, scrollElement, 'auto');
      }, scrollDelay);

      restoreTimeoutRef.current = timeoutId;
    }
  }, [scrollElement, scrollDelay, shouldExcludeScrollRestore]);

  // Save current scroll position
  const saveScrollPosition = useCallback((url: string) => {
    const position = getScrollPosition(scrollElement);
    storeScrollPosition(url, position);
  }, [scrollElement]);

  // Handle route changes
  useEffect(() => {
    const handleStart = (event: any) => {
      const newUrl = event.detail.visit.url;
      const currentPage = window.location.pathname;

      // Save current scroll position before navigation
      if (restoreScrollPosition && currentUrl.current) {
        saveScrollPosition(currentUrl.current);
      }

      // Determine if this is likely back navigation
      // This is a heuristic since InertiaJS doesn't provide explicit back/forward info
      isBackNavigation.current = event.detail.visit.method === 'get' &&
                                  history.state &&
                                  history.length > 1;

      currentUrl.current = newUrl;
    };

    const handleSuccess = (event: any) => {
      const url = event.detail.visit.url;

      // Clear any pending restore timeout
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
        restoreTimeoutRef.current = null;
      }

      if (isBackNavigation.current && restoreScrollPosition) {
        // Restore scroll position for back navigation
        restoreScrollForUrl(url);
      } else if (scrollToTopOnRouteChange && !shouldExcludeScrollToTop(url)) {
        // Scroll to top for forward navigation
        setTimeout(() => {
          scrollToTop();
        }, scrollDelay);
      }

      isBackNavigation.current = false;
    };

    const handleError = () => {
      isBackNavigation.current = false;

      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
        restoreTimeoutRef.current = null;
      }
    };

    // Set initial URL
    currentUrl.current = window.location.pathname + window.location.search;

    // Register event listeners
    document.addEventListener('inertia:start', handleStart);
    document.addEventListener('inertia:success', handleSuccess);
    document.addEventListener('inertia:error', handleError);

    return () => {
      document.removeEventListener('inertia:start', handleStart);
      document.removeEventListener('inertia:success', handleSuccess);
      document.removeEventListener('inertia:error', handleError);

      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
    };
  }, [
    scrollToTopOnRouteChange,
    restoreScrollPosition,
    scrollDelay,
    shouldExcludeScrollToTop,
    shouldExcludeScrollRestore,
    saveScrollPosition,
    restoreScrollForUrl,
    scrollToTop
  ]);

  // Save scroll position on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (restoreScrollPosition && currentUrl.current) {
        saveScrollPosition(currentUrl.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [restoreScrollPosition, saveScrollPosition]);

  return {
    scrollToTop,
    saveScrollPosition: () => saveScrollPosition(currentUrl.current),
    restoreScrollPosition: () => restoreScrollForUrl(currentUrl.current),
    clearStoredPositions: () => {
      try {
        sessionStorage.removeItem(SCROLL_POSITIONS_KEY);
      } catch (error) {
        console.warn('Failed to clear stored scroll positions:', error);
      }
    }
  };
}

/**
 * Hook for scroll-to-top button functionality
 */
export function useScrollToTop(threshold = 300) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollToTop } = useScrollManagement({ scrollBehavior: 'smooth' });

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY || window.pageYOffset;
      setShowScrollTop(scrolled > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { showScrollTop, scrollToTop };
}

/**
 * Hook for preserving scroll position during partial reloads
 */
export function usePreserveScrollOnReload() {
  const scrollPositionRef = useRef<ScrollPosition | null>(null);

  const preserveScroll = useCallback(() => {
    scrollPositionRef.current = getScrollPosition();
  }, []);

  const restoreScroll = useCallback(() => {
    if (scrollPositionRef.current) {
      setScrollPosition(scrollPositionRef.current, null, 'auto');
    }
  }, []);

  // Auto-preserve on partial reloads
  useEffect(() => {
    const handleStart = (event: any) => {
      // Only preserve scroll for partial reloads
      if (event.detail.visit.preserveScroll) {
        preserveScroll();
      }
    };

    const handleSuccess = (event: any) => {
      // Restore scroll after partial reload
      if (event.detail.visit.preserveScroll && scrollPositionRef.current) {
        setTimeout(restoreScroll, 50); // Small delay for DOM updates
      }
    };

    document.addEventListener('inertia:start', handleStart);
    document.addEventListener('inertia:success', handleSuccess);

    return () => {
      document.removeEventListener('inertia:start', handleStart);
      document.removeEventListener('inertia:success', handleSuccess);
    };
  }, [preserveScroll, restoreScroll]);

  return { preserveScroll, restoreScroll };
}