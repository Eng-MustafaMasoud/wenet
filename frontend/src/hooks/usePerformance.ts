"use client";

import { useCallback, useMemo, useRef, useEffect, useState } from "react";

// Hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for throttling function calls
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const lastCallTimer = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        clearTimeout(lastCallTimer.current);
        lastCallTimer.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
}

// Hook for memoizing expensive calculations
export function useExpensiveCalculation<T, R>(
  calculation: (value: T) => R,
  value: T,
  deps: React.DependencyList = []
): R {
  return useMemo(() => {
    console.time("Expensive calculation");
    const result = calculation(value);
    console.timeEnd("Expensive calculation");
    return result;
  }, [value, ...deps]);
}

// Hook for virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => ({
        item,
        index: visibleRange.start + index,
      }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

// Hook for intersection observer with performance optimization
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });

  useEffect(() => {
    const mountTime = Date.now() - startTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} mounted in ${mountTime}ms`);
    }
  }, []);

  return {
    renderCount: renderCount.current,
  };
}

// Hook for memory usage monitoring (browser only)
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "memory" in performance) {
      const updateMemoryInfo = () => {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
}

// Hook for optimizing re-renders with stable references
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

// Hook for batching state updates
export function useBatchedState<T>(
  initialState: T
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState(initialState);
  const batchRef = useRef<Array<() => void>>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedSetState = useCallback((updater: T | ((prev: T) => T)) => {
    batchRef.current.push(() => {
      setState(updater);
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      batchRef.current.forEach((update) => update());
      batchRef.current = [];
    }, 0);
  }, []);

  return [state, batchedSetState];
}
