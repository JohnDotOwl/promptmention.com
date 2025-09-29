import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SmartPollingOptions {
  /**
   * Base polling interval in milliseconds
   * @default 5000
   */
  interval?: number;
  /**
   * Whether to pause polling when page is not visible
   * @default true
   */
  pauseWhenHidden?: boolean;
  /**
   * Maximum number of consecutive failures before stopping
   * @default 5
   */
  maxFailures?: number;
  /**
   * Enable exponential backoff on failures
   * @default true
   */
  exponentialBackoff?: boolean;
  /**
   * Maximum backoff interval in milliseconds
   * @default 30000 (30 seconds)
   */
  maxBackoffInterval?: number;
  /**
   * Condition function to determine if polling should continue
   */
  shouldPoll?: () => boolean;
  /**
   * Callback fired on successful poll
   */
  onSuccess?: (data?: any) => void;
  /**
   * Callback fired on poll error
   */
  onError?: (error: Error) => void;
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
    interval: baseInterval = 5000,
    pauseWhenHidden = true,
    maxFailures = 5,
    exponentialBackoff = true,
    maxBackoffInterval = 30000,
    shouldPoll,
    onSuccess,
    onError,
    priority = 'medium'
  } = options;

  // Priority-based intervals
  const priorityIntervals = {
    critical: baseInterval * 0.5,  // 2.5s for critical data
    high: baseInterval * 0.8,      // 4s for high priority
    medium: baseInterval,          // 5s for medium priority
    low: baseInterval * 2          // 10s for low priority
  };

  const interval = priorityIntervals[priority];

  const [isPolling, setIsPolling] = useState(false);
  const [failures, setFailures] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backoffMultiplier = useRef(1);

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

  // Execute polling function
  const poll = useCallback(async (
    pollFunction: () => Promise<any> | void,
    partialReloadOptions?: PartialReloadOptions
  ) => {
    if (!isVisible && pauseWhenHidden) return;
    if (shouldPoll && !shouldPoll()) return;
    if (failures >= maxFailures) return;

    try {
      let result;

      if (partialReloadOptions) {
        // Use Inertia partial reload
        result = await new Promise((resolve, reject) => {
          router.reload({
            only: partialReloadOptions.only,
            preserveState: partialReloadOptions.preserveState ?? true,
            onFinish: (visit) => {
              if (visit.completed) {
                resolve(visit);
              } else {
                reject(new Error('Request failed'));
              }
            }
          });
        });
      } else if (pollFunction) {
        // Execute custom polling function
        result = await pollFunction();
      }

      // Reset failure count on success
      setFailures(0);
      backoffMultiplier.current = 1;

      onSuccess?.(result);
    } catch (error) {
      const failureCount = failures + 1;
      setFailures(failureCount);

      if (exponentialBackoff) {
        backoffMultiplier.current = Math.random() * 0.5 + 0.5; // Add jitter (0.5-1.0)
      }

      onError?.(error instanceof Error ? error : new Error('Unknown polling error'));

      // Stop polling if max failures reached
      if (failureCount >= maxFailures) {
        console.warn(`Polling stopped after ${maxFailures} consecutive failures`);
        setIsPolling(false);
      }
    }
  }, [isVisible, pauseWhenHidden, shouldPoll, failures, maxFailures, onSuccess, onError, exponentialBackoff]);

  // Start polling
  const startPolling = useCallback((
    pollFunction?: () => Promise<any> | void,
    partialReloadOptions?: PartialReloadOptions
  ) => {
    if (isPolling) return;

    setIsPolling(true);
    setFailures(0);
    backoffMultiplier.current = 1;

    const runPoll = () => {
      poll(pollFunction || (() => {}), partialReloadOptions);

      const currentInterval = getCurrentInterval();
      intervalRef.current = setTimeout(runPoll, currentInterval);
    };

    // Start immediately
    runPoll();
  }, [isPolling, poll, getCurrentInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
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

  // Pause/resume based on visibility
  useEffect(() => {
    if (!pauseWhenHidden || !isPolling) return;

    if (!isVisible) {
      // Pause polling
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (isPolling && !intervalRef.current) {
      // Resume polling
      const runPoll = () => {
        poll(() => {}, undefined);
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
    currentInterval: getCurrentInterval(),
    startPolling,
    stopPolling,
    resetFailures
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