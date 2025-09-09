"use client";

import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { useLoading } from "@/contexts/LoadingContext";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// Enhanced mutation hook with comprehensive loading states
export const useLoadingMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    loadingMessage?: string;
    showGlobalLoading?: boolean;
    showProgress?: boolean;
    successMessage?: string;
    onSuccessCallback?: (data: TData) => void;
    onErrorCallback?: (error: TError) => void;
  }
) => {
  const { withLoading, showSuccess } = useLoading();
  const originalMutationFn = options.mutationFn;

  const enhancedMutationFn = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (!originalMutationFn) {
        throw new Error("mutationFn is required");
      }

      if (options.showGlobalLoading !== false) {
        return withLoading(originalMutationFn(variables), {
          message: options.loadingMessage || "Processing...",
          showProgress: options.showProgress,
          onSuccess: (result: TData) => {
            if (options.successMessage) {
              showSuccess(options.successMessage);
            }
            if (options.onSuccessCallback) {
              options.onSuccessCallback(result);
            }
          },
          onError: (error: Error) => {
            if (options.onErrorCallback) {
              options.onErrorCallback(error as TError);
            }
          },
        });
      }

      return originalMutationFn(variables);
    },
    [originalMutationFn, withLoading, showSuccess, options]
  );

  return useMutation({
    ...options,
    mutationFn: enhancedMutationFn,
  });
};

// Enhanced query hook with loading states
export const useLoadingQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    loadingMessage?: string;
    showGlobalLoading?: boolean;
  }
) => {
  const { withLoading } = useLoading();
  const originalQueryFn = options.queryFn;

  const enhancedQueryFn = useCallback(
    async (context: any): Promise<TQueryFnData> => {
      if (!originalQueryFn || typeof originalQueryFn !== "function") {
        throw new Error("queryFn is required and must be a function");
      }

      if (options.showGlobalLoading) {
        return withLoading(Promise.resolve(originalQueryFn(context)), {
          message: options.loadingMessage || "Loading...",
        });
      }

      return Promise.resolve(originalQueryFn(context));
    },
    [
      originalQueryFn,
      withLoading,
      options.loadingMessage,
      options.showGlobalLoading,
    ]
  );

  return useQuery({
    ...options,
    queryFn: enhancedQueryFn,
  });
};

// Enhanced navigation with loading states
export const useLoadingRouter = () => {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const push = useCallback(
    async (href: string, options?: any) => {
      showLoading("Navigating...");
      try {
        router.push(href, options);
        // Navigation is handled by NavigationLoadingProvider
      } catch (error) {
        hideLoading();
        throw error;
      }
    },
    [router, showLoading, hideLoading]
  );

  const replace = useCallback(
    async (href: string, options?: any) => {
      showLoading("Navigating...");
      try {
        router.replace(href, options);
      } catch (error) {
        hideLoading();
        throw error;
      }
    },
    [router, showLoading, hideLoading]
  );

  const back = useCallback(() => {
    showLoading("Going back...");
    try {
      router.back();
    } catch (error) {
      hideLoading();
      throw error;
    }
  }, [router, showLoading, hideLoading]);

  return {
    push,
    replace,
    back,
    refresh: router.refresh,
    forward: router.forward,
  };
};

// Hook for any async operation with comprehensive loading states
export const useAsyncOperation = () => {
  const { withLoading, showError, showSuccess } = useLoading();

  const execute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        loadingMessage?: string;
        successMessage?: string;
        showProgress?: boolean;
        onSuccess?: (result: T) => void;
        onError?: (error: Error) => void;
        retryFn?: () => void;
      } = {}
    ): Promise<T> => {
      const {
        loadingMessage = "Processing...",
        successMessage,
        showProgress,
        onSuccess,
        onError,
        retryFn,
      } = options;

      try {
        const result = await withLoading(operation(), {
          message: loadingMessage,
          showProgress,
          onSuccess: (result: T) => {
            if (successMessage) {
              showSuccess(successMessage);
            }
            if (onSuccess) {
              onSuccess(result);
            }
          },
          onError: (error: Error) => {
            if (onError) {
              onError(error);
            } else {
              showError(error, retryFn);
            }
          },
        });
        return result;
      } catch (error) {
        // Error is already handled by withLoading
        throw error;
      }
    },
    [withLoading, showError, showSuccess]
  );

  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        loadingMessage?: string;
        successMessage?: string;
        maxRetries?: number;
      } = {}
    ): Promise<T> => {
      const { maxRetries = 3, ...otherOptions } = options;
      let retryCount = 0;

      const attemptOperation = async (): Promise<T> => {
        try {
          return await execute(operation, {
            ...otherOptions,
            retryFn: retryCount < maxRetries ? attemptOperation : undefined,
          });
        } catch (error) {
          retryCount++;
          if (retryCount < maxRetries) {
            // Retry after a short delay
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            );
            return attemptOperation();
          }
          throw error;
        }
      };

      return attemptOperation();
    },
    [execute]
  );

  return {
    execute,
    executeWithRetry,
  };
};

// Hook for progress tracking operations
export const useProgressOperation = () => {
  const { showLoading, updateProgress, hideLoading, showSuccess, showError } =
    useLoading();

  const executeWithProgress = useCallback(
    async <T>(
      operation: (updateProgress: (progress: number) => void) => Promise<T>,
      options: {
        loadingMessage?: string;
        successMessage?: string;
        onComplete?: (result: T) => void;
        onError?: (error: Error) => void;
      } = {}
    ): Promise<T> => {
      const {
        loadingMessage = "Processing...",
        successMessage,
        onComplete,
        onError,
      } = options;

      showLoading(loadingMessage, { showProgress: true });

      try {
        const result = await operation(updateProgress);
        hideLoading();

        if (successMessage) {
          showSuccess(successMessage);
        }

        if (onComplete) {
          onComplete(result);
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
    [showLoading, updateProgress, hideLoading, showSuccess, showError]
  );

  return { executeWithProgress };
};
