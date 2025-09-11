"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import EnhancedLoader, { FullScreenLoader, PageLoader } from "./EnhancedLoader";

interface LoadingState {
  id: string;
  message: string;
  type?: "default" | "parking" | "security" | "admin" | "navigation";
  progress?: number;
  showProgress?: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState[];
  startLoading: (
    id: string,
    message: string,
    type?: LoadingState["type"]
  ) => void;
  stopLoading: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  isLoading: (id?: string) => boolean;
  getLoadingState: (id: string) => LoadingState | undefined;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const startLoading = useCallback(
    (id: string, message: string, type: LoadingState["type"] = "default") => {
      // Clear any existing timeout for this ID
      const existingTimeout = timeoutRefs.current.get(id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      setLoadingStates((prev) => {
        // Remove existing state with same ID
        const filtered = prev.filter((state) => state.id !== id);
        // Add new state
        return [
          ...filtered,
          { id, message, type, progress: 0, showProgress: false },
        ];
      });
    },
    []
  );

  const stopLoading = useCallback((id: string) => {
    // Debounce stopping to prevent flicker
    const timeout = setTimeout(() => {
      setLoadingStates((prev) => prev.filter((state) => state.id !== id));
      timeoutRefs.current.delete(id);
    }, 100);

    timeoutRefs.current.set(id, timeout);
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setLoadingStates((prev) =>
      prev.map((state) =>
        state.id === id
          ? {
              ...state,
              progress: Math.min(100, Math.max(0, progress)),
              showProgress: true,
            }
          : state
      )
    );
  }, []);

  const isLoading = useCallback(
    (id?: string) => {
      if (id) {
        return loadingStates.some((state) => state.id === id);
      }
      return loadingStates.length > 0;
    },
    [loadingStates]
  );

  const getLoadingState = useCallback(
    (id: string) => {
      return loadingStates.find((state) => state.id === id);
    },
    [loadingStates]
  );

  const value: LoadingContextType = {
    loadingStates,
    startLoading,
    stopLoading,
    updateProgress,
    isLoading,
    getLoadingState,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlayManager />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

function LoadingOverlayManager() {
  const { loadingStates } = useLoading();

  // Show overlay for global loading states
  const globalLoadingState = loadingStates.find(
    (state) =>
      state.id === "global" || state.id === "page" || state.id === "navigation"
  );

  if (!globalLoadingState) return null;

  return (
    <FullScreenLoader
      type={globalLoadingState.type}
      message={globalLoadingState.message}
      showProgress={globalLoadingState.showProgress}
      progress={globalLoadingState.progress}
    />
  );
}

// Higher-order component for loading states
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingId: string,
  loadingMessage: string,
  loadingType?: LoadingState["type"]
) {
  return function WithLoadingComponent(props: P) {
    const { startLoading, stopLoading, isLoading: isLoadingFn } = useLoading();
    const isLoading = isLoadingFn(loadingId);

    React.useEffect(() => {
      if (isLoading) {
        startLoading(loadingId, loadingMessage, loadingType);
      } else {
        stopLoading(loadingId);
      }
    }, [isLoading, startLoading, stopLoading]);

    if (isLoading) {
      return (
        <div className="min-h-64 flex items-center justify-center">
          <EnhancedLoader
            type={loadingType}
            message={loadingMessage}
            size="lg"
          />
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for async operations with loading
export function useAsyncWithLoading() {
  const { startLoading, stopLoading, updateProgress } = useLoading();

  const executeWithLoading = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options: {
        id: string;
        message: string;
        type?: LoadingState["type"];
        onProgress?: (progress: number) => void;
      }
    ): Promise<T> => {
      const { id, message, type = "default", onProgress } = options;

      try {
        startLoading(id, message, type);

        // Simulate progress if callback provided
        if (onProgress) {
          const progressInterval = setInterval(() => {
            const randomProgress = Math.random() * 20;
            onProgress(randomProgress);
            updateProgress(id, randomProgress);
          }, 200);

          const result = await operation();
          clearInterval(progressInterval);
          updateProgress(id, 100);

          // Brief delay to show 100% completion
          await new Promise((resolve) => setTimeout(resolve, 200));

          return result;
        } else {
          return await operation();
        }
      } finally {
        stopLoading(id);
      }
    },
    [startLoading, stopLoading, updateProgress]
  );

  return { executeWithLoading };
}

// Component for inline loading states
interface InlineLoaderProps {
  id: string;
  message?: string;
  type?: LoadingState["type"];
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function InlineLoader({
  id,
  message = "Loading...",
  type = "default",
  size = "md",
  className = "",
  children,
}: InlineLoaderProps) {
  const { isLoading: isLoadingFn, getLoadingState } = useLoading();
  const isLoading = isLoadingFn(id);
  const loadingState = getLoadingState(id);

  if (!isLoading && !children) return null;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <EnhancedLoader
          type={type}
          message={loadingState?.message || message}
          size={size}
          showProgress={loadingState?.showProgress}
          progress={loadingState?.progress}
        />
      </div>
    );
  }

  return <>{children}</>;
}

// Loading button component
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

export function LoadingButton({
  loading = false,
  loadingText = "Loading...",
  children,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  const getVariantClasses = () => {
    const base =
      "px-4 py-2 rounded-md font-medium transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed";

    switch (variant) {
      case "primary":
        return `${base} bg-blue-600 text-white hover:bg-blue-700`;
      case "secondary":
        return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`;
      case "danger":
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      default:
        return base;
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${getVariantClasses()} ${
        loading ? "cursor-wait" : ""
      } ${className}`}
      aria-disabled={disabled || loading}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        <span>{loading ? loadingText : children}</span>
      </div>
    </button>
  );
}

// Skeleton components for loading placeholders
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b last:border-b-0">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
