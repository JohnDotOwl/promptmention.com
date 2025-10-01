import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SmartPollingOptions {
  /**
   * Base polling interval in milliseconds
   * @default 10000 (increased from 5000)
   */
  interval?: number;
  /**
   * Whether to pause polling when page is not visible
   * @default true
   */
  pauseWhenHidden?: boolean;
  /**
   * Maximum number of consecutive failures before stopping
   * @default 3 (reduced from 5)
   */
  maxFailures?: number;
  /**
   * Enable exponential backoff on failures
   * @default true
   */
  exponentialBackoff?: boolean;
  /**
   * Maximum backoff interval in milliseconds
   * @default 60000 (increased from 30000)
   */
  maxBackoffInterval?: number;
  /**
   * Request timeout in milliseconds
   * @default 15000
   */
  requestTimeout?: number;
  /**
   * Circuit breaker threshold - stop polling if too many failures
   * @default true
   */
  enableCircuitBreaker?: boolean;
  /**
   * Condition function to determine if polling should continue
   */
  shouldPoll?: () => boolean;
  /**
   * Callback fired on successful poll
   */
  onSuccess?: (data?: unknown) => void;
  /**
   * Callback fired on poll error
   */
  onError?: (error: Error) => void;
  /**
   * Callback fired when polling stops due to failures
   */
  onPollingStopped?: () => void;
  /**
   * Priority level affecting base interval
   * @default 'medium'
   */
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

interface PartialReloadOptions {
  /**
   * Keys to reload from the server
   */
  only?: string[];
  /**
   * Whether to preserve scroll position
   * @default true
   */
  preserveScroll?: boolean;
  /**
   * Whether to preserve form state
   * @default true
   */
  preserveState?: boolean;
}

/**
 * Smart polling hook that handles page visibility, backoff, and failures
 */
export function useSmartPolling(options: SmartPollingOptions = {}) {
  const {
    interval: baseInterval = 10000,
    pauseWhenHidden = true,
    maxFailures = 3,
    exponentialBackoff = true,
    maxBackoffInterval = 60000,
    requestTimeout = 15000,
    enableCircuitBreaker = true,
    shouldPoll,
    onSuccess,
    onError,
    onPollingStopped,
    priority = 'medium'
  } = options;

  // Priority-based intervals (more conservative)
  const priorityIntervals = {
    critical: baseInterval * 0.7,  // 7s for critical data
    high: baseInterval * 0.9,      // 9s for high priority
    medium: baseInterval,          // 10s for medium priority
    low: baseInterval * 1.5        // 15s for low priority
  };

  const interval = priorityIntervals[priority];

  const [isPolling, setIsPolling] = useState(false);
  const [failures, setFailures] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isCircuitBroken, setIsCircuitBroken] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backoffMultiplier = useRef(1);
  const lastRequestTime = useRef(0);
  const requestDebounceDelay = 2000; // Minimum 2 seconds between requests
  const isPollingActive = useRef(false); // Track polling instance to prevent duplicates
  const lastReloadTime = useRef(0); // Track reload calls to prevent duplicates
  const reloadDebounceDelay = 1000; // Minimum 1 second between reloads

  // Track page visibility
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseWhenHidden]);

  // Calculate current interval with backoff
  const getCurrentInterval = useCallback(() => {
    if (!exponentialBackoff || failures === 0) {
      return interval;
    }

    const backoffInterval = interval * Math.pow(2, Math.min(failures, 5)) * backoffMultiplier.current;
    return Math.min(backoffInterval, maxBackoffInterval);
  }, [interval, failures, exponentialBackoff, maxBackoffInterval]);

  // Execute polling function - simplified for Inertia.js
  const poll = useCallback((
    pollFunction?: () => void,
    partialReloadOptions?: PartialReloadOptions
  ) => {
    // Circuit breaker check
    if (enableCircuitBreaker && isCircuitBroken) return;

    // Prevent request spamming
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < requestDebounceDelay) {
      console.log(`Request debounced, only ${timeSinceLastRequest}ms since last request`);
      return;
    }

    if (!isVisible && pauseWhenHidden) return;
    if (shouldPoll && !shouldPoll()) return;
    if (failures >= maxFailures) return;

    // Update last request time
    lastRequestTime.current = now;

    try {
      if (partialReloadOptions) {
        // Additional debounce for reload calls
        const timeSinceLastReload = now - lastReloadTime.current;
        if (timeSinceLastReload < reloadDebounceDelay) {
          console.log(`Reload debounced, only ${timeSinceLastReload}ms since last reload`);
          return;
        }

        lastReloadTime.current = now;

        // Direct router.reload() call - Inertia handles the async nature
        router.reload({
          only: partialReloadOptions.only,
          preserveState: partialReloadOptions.preserveState ?? true,
          preserveScroll: partialReloadOptions.preserveScroll ?? true,
          onSuccess: () => {
            // Reset failure count and circuit breaker on success
            setFailures(0);
            backoffMultiplier.current = 1;
            setIsCircuitBroken(false);
            onSuccess?.();
          },
          onError: (errors) => {
            const failureCount = failures + 1;
            setFailures(failureCount);

            if (exponentialBackoff) {
              backoffMultiplier.current = Math.random() * 0.7 + 0.3;
            }

            onError?.(new Error(`Partial reload failed: ${JSON.stringify(errors)}`));

            // Circuit breaker: stop polling if too many failures
            if (failureCount >= maxFailures) {
              console.warn(`Polling stopped after ${maxFailures} consecutive failures. Circuit breaker activated.`);
              setIsPolling(false);
              setIsCircuitBroken(true);
              onPollingStopped?.();

              // Auto-reset circuit breaker after 5 minutes
              setTimeout(() => {
                setIsCircuitBroken(false);
                setFailures(0);
                backoffMultiplier.current = 1;
                console.log('Circuit breaker reset - polling can resume');
              }, 5 * 60 * 1000);
            }
          }
        });
      } else if (pollFunction) {
        // Execute custom polling function
        pollFunction();
        // Reset failure count on success for custom functions
        setFailures(0);
        backoffMultiplier.current = 1;
        setIsCircuitBroken(false);
        onSuccess?.();
      }
    } catch (error) {
      const failureCount = failures + 1;
      setFailures(failureCount);

      if (exponentialBackoff) {
        backoffMultiplier.current = Math.random() * 0.7 + 0.3;
      }

      const errorObj = error instanceof Error ? error : new Error('Unknown polling error');
      onError?.(errorObj);

      // Circuit breaker: stop polling if too many failures
      if (failureCount >= maxFailures) {
        console.warn(`Polling stopped after ${maxFailures} consecutive failures. Circuit breaker activated.`);
        setIsPolling(false);
        setIsCircuitBroken(true);
        onPollingStopped?.();

        // Auto-reset circuit breaker after 5 minutes
        setTimeout(() => {
          setIsCircuitBroken(false);
          setFailures(0);
          backoffMultiplier.current = 1;
          console.log('Circuit breaker reset - polling can resume');
        }, 5 * 60 * 1000);
      }
    }
  }, [isVisible, pauseWhenHidden, shouldPoll, onSuccess, onError, onPollingStopped, exponentialBackoff, enableCircuitBreaker, requestDebounceDelay, reloadDebounceDelay, maxFailures, failures, isCircuitBroken]);

  // Start polling with instance management
  const startPolling = useCallback((
    pollFunction?: () => void,
    partialReloadOptions?: PartialReloadOptions
  ) => {
    // Prevent multiple polling instances
    if (isPollingActive.current) {
      console.log('Polling already active, ignoring start request');
      return;
    }

    setIsPolling(true);
    setFailures(0);
    backoffMultiplier.current = 1;
    isPollingActive.current = true;

    const runPoll = () => {
      // Only continue if still active
      if (!isPollingActive.current) return;

      poll(pollFunction, partialReloadOptions);

      const currentInterval = getCurrentInterval();
      intervalRef.current = setTimeout(runPoll, currentInterval);
    };

    // Start immediately
    runPoll();
  }, [poll, getCurrentInterval]); // Remove isPolling dependency to prevent loops

  // Stop polling with proper cleanup
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    isPollingActive.current = false; // Clear the active flag
  }, []);

  // Reset failures and restart if needed
  const resetFailures = useCallback(() => {
    setFailures(0);
    backoffMultiplier.current = 1;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  // Pause/resume based on visibility with proper instance management
  useEffect(() => {
    if (!pauseWhenHidden || !isPolling) return;

    if (!isVisible) {
      // Pause polling
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (isPolling && !intervalRef.current && isPollingActive.current) {
      // Resume polling only if still active
      const runPoll = () => {
        // Check if still active before resuming
        if (!isPollingActive.current) return;

        poll(undefined, undefined);
        const currentInterval = getCurrentInterval();
        intervalRef.current = setTimeout(runPoll, currentInterval);
      };

      // Resume after a short delay
      setTimeout(runPoll, 1000);
    }
  }, [isVisible, pauseWhenHidden, isPolling, poll, getCurrentInterval]);

  return {
    isPolling,
    failures,
    isVisible,
    isCircuitBroken,
    currentInterval: getCurrentInterval(),
    startPolling,
    stopPolling,
    resetFailures,
    resetCircuitBreaker: () => {
      setIsCircuitBroken(false);
      setFailures(0);
      backoffMultiplier.current = 1;
      isPollingActive.current = false; // Also reset polling flag
      lastReloadTime.current = 0; // Reset reload debounce timer
    }
  };
}

/**
 * Convenience hook for partial reload polling
 */
export function usePartialReloadPolling(
  onlyKeys: string[],
  options: Omit<SmartPollingOptions, 'priority'> & { priority?: SmartPollingOptions['priority'] } = {}
) {
  const polling = useSmartPolling(options);

  const startPartialPolling = useCallback(() => {
    polling.startPolling(undefined, {
      only: onlyKeys,
      preserveScroll: true,
      preserveState: true
    });
  }, [polling, onlyKeys]);

  return {
    ...polling,
    startPartialPolling
  };
}

/**
 * Hook for conditional polling based on data state
 */
export function useConditionalPolling(
  condition: () => boolean,
  onlyKeys: string[],
  options: SmartPollingOptions = {}
) {
  const polling = usePartialReloadPolling(onlyKeys, {
    ...options,
    shouldPoll: condition
  });

  useEffect(() => {
    if (condition()) {
      polling.startPartialPolling();
    } else {
      polling.stopPolling();
    }
  }, [condition, polling]);

  return polling;
}