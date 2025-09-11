"use client";

import { useState, useCallback } from "react";

interface UseCenteredLoaderReturn {
  isLoading: boolean;
  loadingMessage: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  withLoader: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    message?: string
  ) => (...args: T) => Promise<R>;
}

export function useCenteredLoader(): UseCenteredLoaderReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const showLoader = useCallback((message = "Loading...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoader = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      message = "Loading..."
    ) => {
      return async (...args: T): Promise<R> => {
        try {
          showLoader(message);
          const result = await fn(...args);
          return result;
        } finally {
          hideLoader();
        }
      };
    },
    [showLoader, hideLoader]
  );

  return {
    isLoading,
    loadingMessage,
    showLoader,
    hideLoader,
    withLoader,
  };
}

