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

// Enhanced mutation hook that shows global loading
export const useLoadingMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    loadingMessage?: string;
  }
) => {
  const { withLoading } = useLoading();

  const originalMutationFn = options.mutationFn;

  const enhancedMutationFn = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (!originalMutationFn) {
        throw new Error("mutationFn is required");
      }

      return withLoading(
        originalMutationFn(variables),
        options.loadingMessage || "Processing..."
      );
    },
    [originalMutationFn, withLoading, options.loadingMessage]
  );

  return useMutation({
    ...options,
    mutationFn: enhancedMutationFn,
  });
};

// Enhanced query hook that shows loading for longer operations
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
        return withLoading(
          Promise.resolve(originalQueryFn(context)),
          options.loadingMessage || "Loading..."
        );
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

// Hook for navigation with loading
export const useLoadingRouter = () => {
  const router = useRouter();
  const { withLoading } = useLoading();

  const push = useCallback(
    async (href: string, options?: any) => {
      await withLoading(
        new Promise<void>((resolve) => {
          router.push(href, options);
          // Give some time for navigation to start
          setTimeout(resolve, 100);
        }),
        "Navigating..."
      );
    },
    [router, withLoading]
  );

  const replace = useCallback(
    async (href: string, options?: any) => {
      await withLoading(
        new Promise<void>((resolve) => {
          router.replace(href, options);
          setTimeout(resolve, 100);
        }),
        "Navigating..."
      );
    },
    [router, withLoading]
  );

  const back = useCallback(async () => {
    await withLoading(
      new Promise<void>((resolve) => {
        router.back();
        setTimeout(resolve, 100);
      }),
      "Going back..."
    );
  }, [router, withLoading]);

  return {
    push,
    replace,
    back,
    refresh: router.refresh,
    forward: router.forward,
  };
};

// Hook for any async operation with loading
export const useAsyncOperation = () => {
  const { withLoading } = useLoading();

  const execute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      loadingMessage = "Processing..."
    ): Promise<T> => {
      return withLoading(operation(), loadingMessage);
    },
    [withLoading]
  );

  return { execute };
};
