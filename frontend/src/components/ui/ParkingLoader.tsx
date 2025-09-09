"use client";

import React from "react";

interface ParkingLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
  type?: "default" | "success" | "error" | "warning";
}

export const ParkingLoader: React.FC<ParkingLoaderProps> = ({
  message = "Loading...",
  size = "md",
  variant = "default",
  type = "default",
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const getCarColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getAnimation = () => {
    switch (type) {
      case "success":
        return "animate-bounce";
      case "error":
        return "animate-pulse";
      case "warning":
        return "animate-ping";
      default:
        return "animate-spin";
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center space-x-3">
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 bg-blue-100 rounded-lg border border-blue-200">
            <div className="absolute inset-2 bg-white rounded border border-gray-300 flex items-center justify-center">
              <div
                className={`w-1/2 h-1/3 ${getCarColor()} rounded-sm animate-pulse`}
              ></div>
            </div>
          </div>
          <div
            className={`absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full ${getAnimation()}`}
          >
            <div className="w-3 h-0.5 bg-white rounded-full transform origin-left"></div>
          </div>
        </div>
        <span className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Parking lot background */}
        <div className="absolute inset-0 bg-gray-100 rounded-xl border-2 border-gray-200 shadow-inner">
          {/* Simplified 3x3 grid */}
          <div className="grid grid-cols-3 gap-0.5 p-1 h-full">
            <div className="bg-white rounded border border-gray-200"></div>
            <div className="bg-green-100 rounded border border-green-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`w-2/3 h-1/2 ${getCarColor()} rounded-sm ${getAnimation()}`}
                ></div>
              </div>
            </div>
            <div className="bg-white rounded border border-gray-200"></div>

            <div className="bg-red-100 rounded border border-red-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2/3 h-1/2 bg-red-400 rounded-sm"></div>
              </div>
            </div>
            <div className="bg-white rounded border border-gray-200"></div>
            <div className="bg-blue-100 rounded border border-blue-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2/3 h-1/2 bg-blue-400 rounded-sm animate-pulse"></div>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200"></div>
            <div className="bg-yellow-100 rounded border border-yellow-200 relative">
              <div className="absolute inset-0 bg-yellow-300 animate-pulse opacity-50 rounded"></div>
            </div>
            <div className="bg-white rounded border border-gray-200"></div>
          </div>
        </div>

        {/* Rotating gate barrier */}
        <div
          className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ${getAnimation()} shadow-lg`}
        >
          <div className="w-4 h-0.5 bg-white rounded-full transform origin-left"></div>
        </div>

        {/* Status indicator */}
        <div
          className={`absolute -bottom-2 -left-2 w-5 h-5 ${
            type === "success"
              ? "bg-green-500"
              : type === "error"
              ? "bg-red-500"
              : type === "warning"
              ? "bg-yellow-500"
              : "bg-blue-500"
          } rounded-full flex items-center justify-center shadow-lg animate-pulse`}
        >
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {message && (
        <div className="text-center">
          <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default ParkingLoader;
