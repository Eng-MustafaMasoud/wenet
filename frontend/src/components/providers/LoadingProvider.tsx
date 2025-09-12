"use client";

import { useState, useEffect } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import TopProgressBar from "@/components/ui/TopProgressBar";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

interface LoadingProviderProps {
  children: React.ReactNode;
}

export default function LoadingProvider({ children }: LoadingProviderProps) {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Loading...");
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  const isLoadingActive = isFetching > 0 || isMutating > 0 || authLoading;

  // Start loading with minimum time guarantee
  useEffect(() => {
    if (isLoadingActive && !isLoading) {
      setLoadingStartTime(Date.now());
      setIsLoading(true);
      setProgress(0);

      if (authLoading) {
        setMessage("Initializing app...");
      } else if (isMutating > 0) {
        setMessage("Processing...");
      } else {
        setMessage("Loading data...");
      }
    }
  }, [isLoadingActive, isLoading, isMutating, authLoading]);

  // Simulate progress for better UX
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Don't go to 100% until actually done
        return prev + Math.random() * 8;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Stop loading with minimum time guarantee
  useEffect(() => {
    if (!isLoadingActive && isLoading && loadingStartTime) {
      const elapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, 500 - elapsed); // 500ms minimum

      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
          setLoadingStartTime(null);
        }, 300);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isLoadingActive, isLoading, loadingStartTime]);

  return (
    <>
      {children}
      <TopProgressBar isLoading={isLoading} />
      <LoadingOverlay
        isLoading={isLoading}
        message={message}
        showProgress={true}
        progress={progress}
        className="z-[9999]"
      />
    </>
  );
}
