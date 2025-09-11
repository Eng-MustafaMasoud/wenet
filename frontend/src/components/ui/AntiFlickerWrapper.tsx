"use client";

import React, { useState, useEffect, useRef } from "react";

interface AntiFlickerWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  preserveDimensions?: boolean;
  minHeight?: string;
  className?: string;
  debounceMs?: number;
}

export default function AntiFlickerWrapper({
  children,
  isLoading = false,
  loadingComponent,
  preserveDimensions = true,
  minHeight = "auto",
  className = "",
  debounceMs = 100,
}: AntiFlickerWrapperProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Measure content dimensions when not loading
  useEffect(() => {
    if (!isLoading && contentRef.current && preserveDimensions) {
      const rect = contentRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [isLoading, children, preserveDimensions]);

  // Debounce loading state changes to prevent flicker
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isLoading) {
      // Show loading immediately for better responsiveness
      setShowLoading(true);
    } else {
      // Delay hiding loading to prevent flicker
      timeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, debounceMs]);

  const containerStyle: React.CSSProperties =
    preserveDimensions && dimensions.height > 0
      ? {
          minHeight: `${dimensions.height}px`,
          minWidth: `${dimensions.width}px`,
        }
      : { minHeight };

  const DefaultLoadingComponent = () => (
    <div className="flex items-center justify-center p-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );

  return (
    <div
      className={`loading-container no-flicker ${className}`}
      style={containerStyle}
    >
      {/* Content */}
      <div
        ref={contentRef}
        className={`transition-opacity duration-200 ${
          showLoading ? "opacity-50" : "opacity-100"
        }`}
      >
        {children}
      </div>

      {/* Loading overlay */}
      {showLoading && (
        <div className={`loading-overlay ${showLoading ? "active" : ""}`}>
          {loadingComponent || <DefaultLoadingComponent />}
        </div>
      )}
    </div>
  );
}

// Skeleton component for content placeholders
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function Skeleton({
  className = "",
  width = "100%",
  height = "1rem",
  rounded = false,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded ? "rounded-full" : ""} ${className}`}
      style={{ width, height }}
    />
  );
}

// Skeleton text lines
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? "75%" : "100%"}
        />
      ))}
    </div>
  );
}

// Button skeleton
export function SkeletonButton({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-24 ${className}`} rounded />;
}
