"use client";

import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import {
  setupApiInterceptors,
  cleanupApiInterceptors,
} from "@/services/apiInterceptors";

export const ApiInterceptorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { showLoading, hideLoading } = useLoading();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only setup interceptors on client side
    if (typeof window !== "undefined" && !isInitialized) {
      setupApiInterceptors(showLoading, hideLoading);
      setIsInitialized(true);
    }

    // Cleanup on unmount
    return () => {
      if (isInitialized) {
        cleanupApiInterceptors();
      }
    };
  }, [showLoading, hideLoading, isInitialized]);

  return <>{children}</>;
};
