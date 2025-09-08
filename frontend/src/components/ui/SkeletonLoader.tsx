"use client";

import { cn } from "@/utils/helpers";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "card";
  lines?: number;
  height?: string;
  width?: string;
}

export default function SkeletonLoader({
  className,
  variant = "rectangular",
  lines = 1,
  height,
  width,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  const variantClasses = {
    text: "h-4",
    rectangular: "h-4",
    circular: "rounded-full",
    card: "h-32",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{ height, width }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ height, width }}
    />
  );
}

// Predefined skeleton components for common use cases
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm border", className)}>
      <div className="flex items-center mb-4">
        <SkeletonLoader variant="circular" className="h-10 w-10" />
        <div className="ml-4 flex-1">
          <SkeletonLoader variant="text" className="h-4 w-1/2 mb-2" />
          <SkeletonLoader variant="text" className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonLoader variant="text" lines={3} />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm border", className)}>
      <SkeletonLoader variant="text" className="h-6 w-1/3 mb-4" />
      <SkeletonLoader variant="card" className="h-80 w-full" />
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border", className)}>
      <div className="p-6 border-b">
        <SkeletonLoader variant="text" className="h-6 w-1/4" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonLoader
                  key={colIndex}
                  variant="text"
                  className="flex-1 h-4"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm border", className)}>
      <div className="flex items-center">
        <SkeletonLoader variant="circular" className="h-12 w-12" />
        <div className="ml-4 flex-1">
          <SkeletonLoader variant="text" className="h-4 w-20 mb-2" />
          <SkeletonLoader variant="text" className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
