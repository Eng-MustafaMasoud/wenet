"use client";

import { useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import {
  setupApiInterceptors,
  cleanupApiInterceptors,
} from "@/services/apiInterceptors";

export const ApiInterceptorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    // Set up API interceptors with loading context
    setupApiInterceptors(showLoading, hideLoading);

    // Cleanup on unmount
    return () => {
      cleanupApiInterceptors();
    };
  }, [showLoading, hideLoading]);

  return <>{children}</>;
};
