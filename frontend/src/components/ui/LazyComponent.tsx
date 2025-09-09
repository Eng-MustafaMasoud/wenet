"use client";

import { lazy, Suspense, ComponentType, useEffect, useState } from "react";
import { CardSkeleton } from "./SkeletonLoader";

interface LazyComponentProps {
  fallback?: React.ReactNode;
  [key: string]: any;
}

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function WrappedComponent(props: T & LazyComponentProps) {
    return (
      <Suspense fallback={fallback || <CardSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components for common use cases
// TODO: Uncomment when components are created
// export const LazyChart = withLazyLoading(
//   () => import("@/components/charts/ChartComponent"),
//   <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
// );

// export const LazyTable = withLazyLoading(
//   () => import("@/components/tables/TableComponent"),
//   <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
// );

// export const LazyForm = withLazyLoading(
//   () => import("@/components/forms/FormComponent"),
//   <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
// );

// Hook for lazy loading with intersection observer
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
}
