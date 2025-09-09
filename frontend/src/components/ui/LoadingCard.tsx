"use client";

import React from "react";
import { ParkingLoader } from "./ParkingLoader";

interface LoadingCardProps {
  message?: string;
  type?: "default" | "success" | "error" | "warning";
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  progress?: number;
  className?: string;
  compact?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  message = "Loading...",
  type = "default",
  size = "md",
  showProgress = false,
  progress,
  className = "",
  compact = false,
}) => {
  const getThemeColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-900",
          accent: "text-green-600",
          progress: "from-green-500 to-emerald-500",
        };
      case "error":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-900",
          accent: "text-red-600",
          progress: "from-red-500 to-pink-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-900",
          accent: "text-yellow-600",
          progress: "from-yellow-500 to-orange-500",
        };
      default:
        return {
          bg: "bg-blue-50 border-blue-200",
          text: "text-blue-900",
          accent: "text-blue-600",
          progress: "from-blue-500 to-purple-500",
        };
    }
  };

  const getSizeClasses = () => {
    if (compact) {
      return {
        container: "p-4",
        text: "text-sm",
        loader: "sm" as const,
      };
    }

    switch (size) {
      case "sm":
        return {
          container: "p-4",
          text: "text-sm",
          loader: "sm" as const,
        };
      case "lg":
        return {
          container: "p-8",
          text: "text-lg",
          loader: "lg" as const,
        };
      default:
        return {
          container: "p-6",
          text: "text-base",
          loader: "md" as const,
        };
    }
  };

  const colors = getThemeColors();
  const sizes = getSizeClasses();

  if (compact) {
    return (
      <div
        className={`${colors.bg} border rounded-lg ${sizes.container} ${className}`}
      >
        <div className="flex items-center space-x-3">
          <ParkingLoader variant="compact" size={sizes.loader} type={type} />
          <div>
            <p className={`${colors.accent} font-medium ${sizes.text}`}>
              {message}
            </p>
            {showProgress && progress !== undefined && (
              <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className={`bg-gradient-to-r ${colors.progress} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${colors.bg} border rounded-xl ${sizes.container} ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <ParkingLoader size={sizes.loader} type={type} />

        <div className="text-center w-full">
          <p className={`${colors.accent} font-medium ${sizes.text} mb-2`}>
            {message}
          </p>

          {showProgress && progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${colors.progress} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-center space-x-1 mt-3">
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

export default LoadingCard;
