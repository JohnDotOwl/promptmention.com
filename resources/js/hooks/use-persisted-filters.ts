import { useCallback, useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';

interface FilterState {
  [key: string]: any;
}

interface PersistentFilter {
  value: any;
  timestamp: number;
  url: string;
}

interface PersistedFiltersOptions {
  /**
   * Unique key for storing filters
   */
  key: string;
  /**
   * Maximum age for stored filters in minutes
   * @default 120 (2 hours)
   */
  maxAge?: number;
  /**
   * Whether to sync filters with URL parameters
   * @default true
   */
  syncWithUrl?: boolean;
  /**
   * Whether to trigger partial reloads when filters change
   * @default true
   */
  autoReload?: boolean;
  /**
   * Keys to include in partial reloads
   */
  reloadOnly?: string[];
  /**
   * Debounce delay for auto-reload in milliseconds
   * @default 300
   */
  debounceDelay?: number;
  /**
   * Callback when filters are applied
   */
  onFiltersApplied?: (filters: FilterState) => void;
  /**
   * Callback when filters are loaded from storage
   */
  onFiltersLoaded?: (filters: FilterState) => void;
}

/**
 * Generate storage key for filters
 */
function getFilterStorageKey(key: string, url?: string): string {
  const currentUrl = url || window.location.pathname;
  return `persisted_filters_${key}_${btoa(currentUrl).replace(/[/+=]/g, '')}`;
}

/**
 * Load filters from localStorage
 */
function loadStoredFilters(key: string, maxAge: number, url?: string): FilterState | null {
  try {
    const storageKey = getFilterStorageKey(key, url);
    const stored = localStorage.getItem(storageKey);

    if (!stored) return null;

    const parsed: Record<string, PersistentFilter> = JSON.parse(stored);
    const now = Date.now();
    const result: FilterState = {};

    // Check each filter's age and include valid ones
    Object.entries(parsed).forEach(([filterKey, filter]) => {
      if (filter.timestamp && now - filter.timestamp <= maxAge * 60 * 1000) {
        result[filterKey] = filter.value;
      }
    });

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.warn('Failed to load persisted filters:', error);
    return null;
  }
}

/**
 * Save filters to localStorage
 */
function saveStoredFilters(key: string, filters: FilterState, url?: string): void {
  try {
    const storageKey = getFilterStorageKey(key, url);
    const timestamp = Date.now();
    const currentUrl = url || window.location.pathname;

    const toStore: Record<string, PersistentFilter> = {};
    Object.entries(filters).forEach(([filterKey, value]) => {
      toStore[filterKey] = {
        value,
        timestamp,
        url: currentUrl
      };
    });

    localStorage.setItem(storageKey, JSON.stringify(toStore));
  } catch (error) {
    console.warn('Failed to save persisted filters:', error);
  }
}

/**
 * Load filters from URL parameters
 */
function loadFiltersFromUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const filters: FilterState = {};

  params.forEach((value, key) => {
    // Try to parse JSON values, fallback to string
    try {
      const parsed = JSON.parse(value);
      filters[key] = parsed;
    } catch {
      filters[key] = value;
    }
  });

  return filters;
}

/**
 * Update URL with current filters
 */
function updateUrlWithFilters(filters: FilterState, replaceState = true): void {
  const url = new URL(window.location.href);

  // Clear existing filter params
  const newParams = new URLSearchParams();

  // Add non-empty filters to URL
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      newParams.set(key, stringValue);
    }
  });

  url.search = newParams.toString();

  if (replaceState) {
    window.history.replaceState(null, '', url.toString());
  } else {
    window.history.pushState(null, '', url.toString());
  }
}

/**
 * Hook for managing persistent table filters
 */
export function usePersistedFilters(options: PersistedFiltersOptions) {
  const {
    key,
    maxAge = 120,
    syncWithUrl = true,
    autoReload = true,
    reloadOnly,
    debounceDelay = 300,
    onFiltersApplied,
    onFiltersLoaded
  } = options;

  // Initialize filters from URL or storage
  const getInitialFilters = useCallback((): FilterState => {
    if (syncWithUrl) {
      const urlFilters = loadFiltersFromUrl();
      if (Object.keys(urlFilters).length > 0) {
        return urlFilters;
      }
    }

    const storedFilters = loadStoredFilters(key, maxAge);
    if (storedFilters) {
      onFiltersLoaded?.(storedFilters);
      return storedFilters;
    }

    return {};
  }, [key, maxAge, syncWithUrl, onFiltersLoaded]);

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce timer reference
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply filters with debouncing
  const applyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);

    // Save to storage
    saveStoredFilters(key, newFilters);

    // Update URL if syncing
    if (syncWithUrl) {
      updateUrlWithFilters(newFilters);
    }

    // Debounced auto-reload
    if (autoReload) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setIsLoading(true);

        router.reload({
          only: reloadOnly,
          preserveState: true,
          onFinish: () => {
            setIsLoading(false);
            onFiltersApplied?.(newFilters);
          }
        });
      }, debounceDelay);
    } else {
      onFiltersApplied?.(newFilters);
    }
  }, [key, syncWithUrl, autoReload, reloadOnly, debounceDelay, onFiltersApplied]);

  // Set individual filter
  const setFilter = useCallback((filterKey: string, value: any) => {
    const newFilters = { ...filters, [filterKey]: value };
    applyFilters(newFilters);
  }, [filters, applyFilters]);

  // Remove filter
  const removeFilter = useCallback((filterKey: string) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    applyFilters(newFilters);
  }, [filters, applyFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    applyFilters({});
  }, [applyFilters]);

  // Check if filter is active
  const hasFilter = useCallback((filterKey: string) => {
    return filterKey in filters && filters[filterKey] !== null && filters[filterKey] !== undefined && filters[filterKey] !== '';
  }, [filters]);

  // Get filter value
  const getFilter = useCallback(<T = any>(filterKey: string, defaultValue?: T): T => {
    return hasFilter(filterKey) ? filters[filterKey] : (defaultValue as T);
  }, [filters, hasFilter]);

  // Apply multiple filters at once
  const setBulkFilters = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    applyFilters(updatedFilters);
  }, [filters, applyFilters]);

  // Get active filters count
  const activeFiltersCount = useCallback(() => {
    return Object.keys(filters).filter(key => hasFilter(key)).length;
  }, [filters, hasFilter]);

  // Export filters for sharing
  const exportFilters = useCallback(() => {
    return {
      filters,
      timestamp: Date.now(),
      url: window.location.pathname
    };
  }, [filters]);

  // Import filters
  const importFilters = useCallback((importedData: { filters: FilterState }) => {
    applyFilters(importedData.filters);
  }, [applyFilters]);

  // Handle browser back/forward navigation
  useEffect(() => {
    if (!syncWithUrl) return;

    const handlePopState = () => {
      const urlFilters = loadFiltersFromUrl();
      setFilters(urlFilters);
      saveStoredFilters(key, urlFilters);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncWithUrl, key]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    filters,
    setFilter,
    setFilters: setBulkFilters,
    removeFilter,
    clearFilters,
    hasFilter,
    getFilter,
    activeFiltersCount,
    isLoading,
    exportFilters,
    importFilters
  };
}

/**
 * Hook for search functionality with persistence
 */
export function usePersistedSearch(options: Omit<PersistedFiltersOptions, 'key'> & { key: string }) {
  const filterHook = usePersistedFilters(options);

  const searchTerm = filterHook.getFilter('search', '');
  const setSearchTerm = useCallback((term: string) => {
    filterHook.setFilter('search', term);
  }, [filterHook]);

  const clearSearch = useCallback(() => {
    filterHook.removeFilter('search');
  }, [filterHook]);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    isLoading: filterHook.isLoading
  };
}

/**
 * Hook for pagination with persistence
 */
export function usePersistedPagination(options: Omit<PersistedFiltersOptions, 'key'> & { key: string }) {
  const filterHook = usePersistedFilters(options);

  const page = filterHook.getFilter('page', 1);
  const perPage = filterHook.getFilter('per_page', 15);

  const setPage = useCallback((newPage: number) => {
    filterHook.setFilter('page', newPage);
  }, [filterHook]);

  const setPerPage = useCallback((newPerPage: number) => {
    filterHook.setFilters({ per_page: newPerPage, page: 1 }); // Reset to first page when changing per page
  }, [filterHook]);

  const resetPagination = useCallback(() => {
    filterHook.removeFilter('page');
  }, [filterHook]);

  return {
    page,
    perPage,
    setPage,
    setPerPage,
    resetPagination,
    isLoading: filterHook.isLoading
  };
}

/**
 * Hook for sorting with persistence
 */
export function usePersistedSort(options: Omit<PersistedFiltersOptions, 'key'> & { key: string }) {
  const filterHook = usePersistedFilters(options);

  const sortBy = filterHook.getFilter('sort', null);
  const sortDirection = filterHook.getFilter('direction', 'asc');

  const setSort = useCallback((field: string, direction: 'asc' | 'desc' = 'asc') => {
    filterHook.setFilters({ sort: field, direction });
  }, [filterHook]);

  const toggleSort = useCallback((field: string) => {
    const currentDirection = sortBy === field ? sortDirection : 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    setSort(field, newDirection);
  }, [sortBy, sortDirection, setSort]);

  const clearSort = useCallback(() => {
    filterHook.removeFilter('sort');
    filterHook.removeFilter('direction');
  }, [filterHook]);

  return {
    sortBy,
    sortDirection,
    setSort,
    toggleSort,
    clearSort,
    isLoading: filterHook.isLoading
  };
}