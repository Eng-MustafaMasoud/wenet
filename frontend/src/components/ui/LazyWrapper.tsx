"use client";

import React, {
  Suspense,
  lazy,
  ComponentType,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./ErrorBoundary";

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  animation?: "fade" | "slide" | "scale" | "none";
  delay?: number;
  duration?: number;
}

interface LazyComponentProps {
  component: ComponentType<any>;
  props?: any;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  animation?: "fade" | "slide" | "scale" | "none";
  delay?: number;
  duration?: number;
}

const DefaultFallback: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center p-8"
  >
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
      <div
        className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
        style={{ animationDelay: "0.1s" }}
      />
      <div
        className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  </motion.div>
);

const LoadingSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`animate-pulse ${className}`}
  >
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded ${
          i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
        } mb-2`}
      />
    ))}
  </motion.div>
);

const getAnimationVariants = (
  animation: string,
  delay: number,
  duration: number
) => {
  const baseTransition = { duration, delay };

  switch (animation) {
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition,
      };
    case "slide":
      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: baseTransition,
      };
    case "scale":
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: baseTransition,
      };
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      };
  }
};

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <DefaultFallback />,
  threshold = 0.1,
  rootMargin = "50px",
  triggerOnce = true,
  className = "",
  animation = "fade",
  delay = 0,
  duration = 0.3,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasBeenVisible(true);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  const shouldShow = triggerOnce ? hasBeenVisible : isVisible;
  const animationProps = getAnimationVariants(animation, delay, duration);

  return (
    <div ref={elementRef} className={className}>
      <AnimatePresence mode="wait">
        {shouldShow ? (
          <motion.div key="content" {...animationProps}>
            {children}
          </motion.div>
        ) : (
          <motion.div key="fallback" {...animationProps}>
            {fallback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  props = {},
  fallback = <DefaultFallback />,
  ...lazyProps
}) => {
  return (
    <LazyWrapper fallback={fallback} {...lazyProps}>
      <Component {...props} />
    </LazyWrapper>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  options: Omit<LazyComponentProps, "component" | "props"> = {}
) => {
  const Wrapped: React.FC<P> = (props: P) => (
    <LazyComponent component={Component} props={props} {...options} />
  );
  Wrapped.displayName = `withLazyLoading(${
    Component.displayName || Component.name || "Component"
  })`;
  return Wrapped;
};

// Lazy loading utilities
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  const Wrapped: React.FC<P> = (props: P) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  Wrapped.displayName = "LazyLoadedComponent";
  return Wrapped;
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  if (typeof window !== "undefined") {
    // Preload on idle
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => importFunc());
    } else {
      setTimeout(() => importFunc(), 0);
    }
  }
};

// Lazy loading with error boundary
export const LazyWithErrorBoundary = <P extends object>({
  component: Component,
  errorFallback,
  ...props
}: LazyComponentProps & { errorFallback?: ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return errorFallback || <div>Error loading component</div>;
  }

  return (
    <LazyWrapper
      {...props}
      fallback={
        <div>
          {props.fallback}
          <ErrorBoundary onError={() => setHasError(true)}>
            <div />
          </ErrorBoundary>
        </div>
      }
    >
      <ErrorBoundary onError={() => setHasError(true)}>
        <Component {...(props.props || {})} />
      </ErrorBoundary>
    </LazyWrapper>
  );
};

// Export default
export default LazyWrapper;

// Re-export for convenience
export { LoadingSkeleton, DefaultFallback };
