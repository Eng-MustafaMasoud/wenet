"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface LoadingState {
  isLoading: boolean;
  message: string;
  type: "default" | "success" | "error" | "warning";
  progress?: number;
  canCancel?: boolean;
  showProgress?: boolean;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
  canRetry: boolean;
  retryFn?: () => void;
}

interface LoadingContextType {
  // Loading state
  loadingState: LoadingState;
  errorState: ErrorState;

  // Loading actions
  showLoading: (message?: string, options?: Partial<LoadingState>) => void;
  hideLoading: () => void;
  updateProgress: (progress: number) => void;

  // Error actions
  showError: (error: string | Error, retryFn?: () => void) => void;
  hideError: () => void;
  retryLastAction: () => void;

  // Success actions
  showSuccess: (message: string, duration?: number) => void;

  // Enhanced promise wrapper
  withLoading: <T>(
    promise: Promise<T>,
    options?: {
      message?: string;
      showProgress?: boolean;
      onError?: (error: Error) => void;
      onSuccess?: (result: T) => void;
    }
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "Loading...",
    type: "default",
    progress: undefined,
    canCancel: false,
    showProgress: false,
  });

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: "",
    canRetry: false,
    retryFn: undefined,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showLoading = useCallback(
    (message: string = "Loading...", options: Partial<LoadingState> = {}) => {
      setLoadingState((prev) => ({
        ...prev,
        isLoading: true,
        message,
        type: "default",
        ...options,
      }));
      // Hide any existing errors when showing loading
      setErrorState((prev) => ({ ...prev, hasError: false }));
    },
    []
  );

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState((prev) => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const showError = useCallback(
    (error: string | Error, retryFn?: () => void) => {
      const errorMessage = error instanceof Error ? error.message : error;
      setErrorState({
        hasError: true,
        error: error instanceof Error ? error : new Error(error),
        errorMessage,
        canRetry: !!retryFn,
        retryFn,
      });
      setLoadingState((prev) => ({ ...prev, isLoading: false }));
    },
    []
  );

  const hideError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorMessage: "",
      canRetry: false,
      retryFn: undefined,
    });
  }, []);

  const retryLastAction = useCallback(() => {
    if (errorState.retryFn) {
      hideError();
      errorState.retryFn();
    }
  }, [errorState.retryFn, hideError]);

  const showSuccess = useCallback(
    (message: string, duration: number = 3000) => {
      setLoadingState((prev) => ({
        ...prev,
        isLoading: true,
        message,
        type: "success",
      }));

      setTimeout(() => {
        hideLoading();
      }, duration);
    },
    [hideLoading]
  );

  const withLoading = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        message?: string;
        showProgress?: boolean;
        onError?: (error: Error) => void;
        onSuccess?: (result: T) => void;
      } = {}
    ): Promise<T> => {
      const {
        message = "Loading...",
        showProgress = false,
        onError,
        onSuccess,
      } = options;

      showLoading(message, { showProgress });

      try {
        const result = await promise;
        hideLoading();

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        hideLoading();
        const err = error instanceof Error ? error : new Error(String(error));

        if (onError) {
          onError(err);
        } else {
          showError(err);
        }

        throw error;
      }
    },
    [showLoading, hideLoading, showError]
  );

  const value: LoadingContextType = {
    loadingState,
    errorState,
    showLoading,
    hideLoading,
    updateProgress,
    showError,
    hideError,
    retryLastAction,
    showSuccess,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isMounted && (loadingState.isLoading || errorState.hasError) && (
        <EnhancedGlobalLoader
          loadingState={loadingState}
          errorState={errorState}
          onRetry={retryLastAction}
          onDismissError={hideError}
        />
      )}
    </LoadingContext.Provider>
  );
};

// Enhanced Global Loader Component with transitions and error handling
interface EnhancedGlobalLoaderProps {
  loadingState: LoadingState;
  errorState: ErrorState;
  onRetry: () => void;
  onDismissError: () => void;
}

const EnhancedGlobalLoader: React.FC<EnhancedGlobalLoaderProps> = ({
  loadingState,
  errorState,
  onRetry,
  onDismissError,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (loadingState.isLoading || errorState.hasError) {
      setShouldRender(true);
      // Small delay to allow DOM to update before starting animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [loadingState.isLoading, errorState.hasError]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-300 ease-out ${
        isVisible
          ? "bg-black bg-opacity-50 backdrop-blur-sm"
          : "bg-black bg-opacity-0 backdrop-blur-none"
      }`}
      suppressHydrationWarning={true}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {errorState.hasError ? (
          <ErrorDisplay
            errorState={errorState}
            onRetry={onRetry}
            onDismiss={onDismissError}
          />
        ) : (
          <LoadingDisplay loadingState={loadingState} />
        )}
      </div>
    </div>
  );
};

// Loading Display Component
interface LoadingDisplayProps {
  loadingState: LoadingState;
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ loadingState }) => {
  const { message, type, progress, showProgress } = loadingState;

  const getThemeColors = () => {
    switch (type) {
      case "success":
        return {
          gradient: "from-green-500 to-emerald-500",
          bg: "bg-green-50",
          text: "text-green-900",
          accent: "text-green-600",
        };
      case "error":
        return {
          gradient: "from-red-500 to-pink-500",
          bg: "bg-red-50",
          text: "text-red-900",
          accent: "text-red-600",
        };
      case "warning":
        return {
          gradient: "from-yellow-500 to-orange-500",
          bg: "bg-yellow-50",
          text: "text-yellow-900",
          accent: "text-yellow-600",
        };
      default:
        return {
          gradient: "from-blue-500 to-purple-500",
          bg: "bg-white",
          text: "text-gray-900",
          accent: "text-blue-600",
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div
      className={`${colors.bg} rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-6 max-w-md mx-4 border border-gray-100 transform transition-all duration-300`}
    >
      {/* Header with branding */}
      <div className="text-center">
        <div className="mb-4">
          {type === "success" ? (
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 relative">
              <span className="text-white text-2xl font-bold">🅿️</span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full animate-spin">
                <div className="w-4 h-0.5 bg-blue-500 rounded-full transform origin-left absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          )}
        </div>
        <h3 className={`text-xl font-bold ${colors.text} mb-1`}>ParkFlow</h3>
        <div
          className={`w-16 h-0.5 bg-gradient-to-r ${colors.gradient} rounded-full mx-auto`}
        ></div>
      </div>

      {/* Loading animation */}
      <div className="w-full flex flex-col items-center space-y-4">
        <EnhancedParkingLoader type={type} size="lg" />

        {/* Message */}
        <div className="text-center">
          <p className={`${colors.accent} font-medium text-lg mb-2`}>
            {message}
          </p>

          {/* Progress bar */}
          {showProgress && progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full transition-all duration-300 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Loading dots */}
          <div className="flex items-center justify-center space-x-1">
            <div
              className={`w-2 h-2 bg-current rounded-full animate-bounce ${colors.accent}`}
            ></div>
            <div
              className={`w-2 h-2 bg-current rounded-full animate-bounce ${colors.accent}`}
              style={{ animationDelay: "0.1s" }}
              suppressHydrationWarning={true}
            ></div>
            <div
              className={`w-2 h-2 bg-current rounded-full animate-bounce ${colors.accent}`}
              style={{ animationDelay: "0.2s" }}
              suppressHydrationWarning={true}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error Display Component
interface ErrorDisplayProps {
  errorState: ErrorState;
  onRetry: () => void;
  onDismiss: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errorState,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-6 max-w-md mx-4 border border-red-100">
      {/* Error icon */}
      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* Error message */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-red-900 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-red-600 mb-4">{errorState.errorMessage}</p>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-3">
        {errorState.canRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
        <button
          onClick={onDismiss}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

// Enhanced Parking Loader for different states
interface EnhancedParkingLoaderProps {
  type: "default" | "success" | "error" | "warning";
  size: "sm" | "md" | "lg";
}

const EnhancedParkingLoader: React.FC<EnhancedParkingLoaderProps> = ({
  type,
  size,
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const getAnimation = () => {
    switch (type) {
      case "success":
        return "animate-bounce";
      case "error":
        return "animate-pulse";
      case "warning":
        return "animate-ping";
      default:
        return "animate-spin";
    }
  };

  const getCarColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Parking lot background */}
      <div className="absolute inset-0 bg-gray-100 rounded-xl border-2 border-gray-200 shadow-inner">
        {/* Parking spaces grid */}
        <div className="grid grid-cols-3 gap-0.5 p-1 h-full">
          <div className="bg-white rounded border border-gray-200"></div>
          <div className="bg-green-100 rounded border border-green-200 relative">
            <div
              className={`absolute inset-0 flex items-center justify-center`}
            >
              <div
                className={`w-2/3 h-1/2 ${getCarColor()} rounded-sm ${getAnimation()}`}
              ></div>
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200"></div>

          <div className="bg-red-100 rounded border border-red-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2/3 h-1/2 bg-red-400 rounded-sm"></div>
            </div>
          </div>
          <div className="bg-white rounded border border-gray-200"></div>
          <div className="bg-blue-100 rounded border border-blue-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2/3 h-1/2 bg-blue-400 rounded-sm animate-pulse"></div>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200"></div>
          <div className="bg-yellow-100 rounded border border-yellow-200 relative">
            <div className="absolute inset-0 bg-yellow-300 animate-pulse opacity-50 rounded"></div>
          </div>
          <div className="bg-white rounded border border-gray-200"></div>
        </div>
      </div>

      {/* Rotating gate barrier */}
      <div
        className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ${getAnimation()} shadow-lg`}
      >
        <div className="w-4 h-0.5 bg-white rounded-full transform origin-left"></div>
      </div>

      {/* Status indicator */}
      <div
        className={`absolute -bottom-2 -left-2 w-5 h-5 ${
          type === "success"
            ? "bg-green-500"
            : type === "error"
            ? "bg-red-500"
            : type === "warning"
            ? "bg-yellow-500"
            : "bg-blue-500"
        } rounded-full flex items-center justify-center shadow-lg animate-pulse`}
      >
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
};
