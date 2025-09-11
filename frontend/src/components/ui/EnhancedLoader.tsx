"use client";

import React, { useEffect, useState } from "react";
import { Car, MapPin, Shield, Activity, Users, Settings } from "lucide-react";

interface EnhancedLoaderProps {
  type?: "default" | "parking" | "security" | "admin" | "navigation";
  message?: string;
  submessage?: string;
  showProgress?: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function EnhancedLoader({
  type = "default",
  message = "Loading...",
  submessage,
  showProgress = false,
  progress = 0,
  size = "md",
  className = "",
}: EnhancedLoaderProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return { container: "h-32 w-32", icon: "h-8 w-8", text: "text-sm" };
      case "md":
        return { container: "h-40 w-40", icon: "h-10 w-10", text: "text-base" };
      case "lg":
        return { container: "h-48 w-48", icon: "h-12 w-12", text: "text-lg" };
      case "xl":
        return { container: "h-56 w-56", icon: "h-16 w-16", text: "text-xl" };
      default:
        return { container: "h-40 w-40", icon: "h-10 w-10", text: "text-base" };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "parking":
        return Car;
      case "security":
        return Shield;
      case "admin":
        return Settings;
      case "navigation":
        return MapPin;
      default:
        return Activity;
    }
  };

  const getColors = () => {
    switch (type) {
      case "parking":
        return {
          primary: "from-blue-500 to-cyan-500",
          secondary: "from-blue-600 to-cyan-600",
          accent: "text-blue-600",
          ring: "border-blue-500",
        };
      case "security":
        return {
          primary: "from-green-500 to-emerald-500",
          secondary: "from-green-600 to-emerald-600",
          accent: "text-green-600",
          ring: "border-green-500",
        };
      case "admin":
        return {
          primary: "from-purple-500 to-violet-500",
          secondary: "from-purple-600 to-violet-600",
          accent: "text-purple-600",
          ring: "border-purple-500",
        };
      case "navigation":
        return {
          primary: "from-orange-500 to-red-500",
          secondary: "from-orange-600 to-red-600",
          accent: "text-orange-600",
          ring: "border-orange-500",
        };
      default:
        return {
          primary: "from-indigo-500 to-blue-500",
          secondary: "from-indigo-600 to-blue-600",
          accent: "text-indigo-600",
          ring: "border-indigo-500",
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const IconComponent = getIcon();
  const colors = getColors();

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      {/* Main loader container */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className={`${sizeClasses.container} rounded-full border-4 border-transparent animate-spin relative`}
          style={{
            borderTopColor: "currentColor",
            borderRightColor: "rgba(59, 130, 246, 0.3)",
            color: "#3b82f6",
            animationDuration: "2s",
          }}
        >
          {/* Middle ring */}
          <div
            className={`absolute inset-2 rounded-full border-2 border-transparent animate-spin`}
            style={{
              borderBottomColor: "currentColor",
              borderLeftColor: "rgba(139, 92, 246, 0.3)",
              color: "#8b5cf6",
              animationDuration: "3s",
              animationDirection: "reverse",
            }}
          >
            {/* Inner content area */}
            <div
              className={`absolute inset-3 bg-gradient-to-br ${colors.primary} rounded-full flex items-center justify-center shadow-lg`}
            >
              {/* Animated icon */}
              <IconComponent
                className={`${sizeClasses.icon} text-white animate-pulse`}
                style={{
                  animationDuration: "1.5s",
                }}
              />

              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-shimmer"
                style={{
                  animationDuration: "2.5s",
                }}
              />
            </div>
          </div>
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"
            style={{
              top: `${20 + Math.sin((i * Math.PI) / 3) * 60}%`,
              left: `${20 + Math.cos((i * Math.PI) / 3) * 60}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: "2s",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-64 mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 bg-gradient-to-r ${colors.primary} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
              style={{ width: `${progress}%` }}
            >
              {/* Progress shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Text content */}
      <div className="mt-6 text-center max-w-xs">
        <h3
          className={`font-semibold ${colors.accent} ${sizeClasses.text} mb-1`}
        >
          {message}
        </h3>
        {submessage && (
          <p className="text-gray-500 text-sm leading-relaxed">{submessage}</p>
        )}

        {/* Animated dots */}
        <div className="flex justify-center mt-3 space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.primary} animate-bounce`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.4s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Full-screen loader overlay
export function FullScreenLoader({
  type = "default",
  message = "Loading...",
  submessage,
  showProgress = false,
  progress = 0,
}: Omit<EnhancedLoaderProps, "size" | "className">) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
        <EnhancedLoader
          type={type}
          message={message}
          submessage={submessage}
          showProgress={showProgress}
          progress={progress}
          size="lg"
        />
      </div>
    </div>
  );
}

// Page loader for route transitions
export function PageLoader({
  message = "Loading page...",
  type = "navigation",
}: {
  message?: string;
  type?: EnhancedLoaderProps["type"];
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <EnhancedLoader
          type={type}
          message={message}
          submessage="Please wait while we prepare your content"
          size="xl"
        />
      </div>
    </div>
  );
}
