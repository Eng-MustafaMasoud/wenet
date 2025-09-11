"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AntiFlickerSystemProps {
  children: React.ReactNode;
  className?: string;
}

export function AntiFlickerSystem({
  children,
  className = "",
}: AntiFlickerSystemProps) {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Prevent initial flicker by ensuring content is ready
    const timer = setTimeout(() => {
      setIsReady(true);
      // Small delay to ensure smooth appearance
      setTimeout(() => setIsVisible(true), 16); // One frame delay
    }, 0);

    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Preserve dimensions during transitions
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (containerRef.current && !dimensions) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [dimensions]);

  if (!isReady) {
    return (
      <div
        ref={containerRef}
        className={`min-h-screen ${className}`}
        style={{
          visibility: "hidden",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={`min-h-screen ${className}`}
      style={{
        minHeight: dimensions?.height ? `${dimensions.height}px` : "auto",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration: 0.25,
            ease: "easeInOut",
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Enhanced page transition component
interface SmoothPageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionKey?: string | number;
}

export function SmoothPageTransition({
  children,
  className = "",
  transitionKey,
}: SmoothPageTransitionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`min-h-screen ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={`min-h-screen ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Loading skeleton component
interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({
  lines = 3,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            index === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

// Button loading state component
interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function ButtonLoader({
  isLoading,
  children,
  loadingText = "Loading...",
  className = "",
}: ButtonLoaderProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ opacity: isLoading ? 0.7 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-md"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">
                {loadingText}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AntiFlickerSystem;
