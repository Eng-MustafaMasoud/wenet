"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { NotificationProvider } from "@/components/ui/NotificationSystem";
import { LoadingProvider } from "@/components/ui/LoadingStateManager";
import { ConnectionManager } from "@/components/ui/ConnectionManager";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Application Error:", error, errorInfo);
        // Here you could send to error reporting service
      }}
    >
      <Provider store={store}>
        <NotificationProvider>
          <LoadingProvider>
            <ConnectionManager
              wsUrl={process.env.NEXT_PUBLIC_WS_URL}
              reconnectInterval={5000}
              maxReconnectAttempts={5}
              heartbeatInterval={30000}
            >
              <div className="min-h-screen bg-gray-50">{children}</div>
            </ConnectionManager>
          </LoadingProvider>
        </NotificationProvider>
      </Provider>
    </ErrorBoundary>
  );
}

// Responsive layout wrapper
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({
  children,
  className = "",
}: ResponsiveLayoutProps) {
  return (
    <div
      className={`
      container mx-auto px-4 sm:px-6 lg:px-8 
      responsive-grid tablet-grid
      ${className}
    `}
    >
      {children}
    </div>
  );
}

// Card wrapper with responsive behavior
interface ResponsiveCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function ResponsiveCard({
  children,
  title,
  description,
  className = "",
  padding = "md",
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
      bg-white rounded-lg shadow-sm border border-gray-200 
      ${paddingClasses[padding]}
      ${className}
    `}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Grid layout with responsive behavior
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = 3,
  gap = "md",
  className = "",
}: ResponsiveGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div
      className={`
      grid ${colClasses[cols]} ${gapClasses[gap]}
      responsive-grid tablet-grid
      ${className}
    `}
    >
      {children}
    </div>
  );
}

// Stack layout for mobile-first design
interface StackProps {
  children: React.ReactNode;
  direction?: "vertical" | "horizontal";
  spacing?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end";
  className?: string;
}

export function Stack({
  children,
  direction = "vertical",
  spacing = "md",
  align = "start",
  className = "",
}: StackProps) {
  const directionClasses = {
    vertical: "flex-col mobile-stack",
    horizontal: "flex-row mobile-stack",
  };

  const spacingClasses = {
    sm: direction === "vertical" ? "space-y-2" : "space-x-2",
    md: direction === "vertical" ? "space-y-4" : "space-x-4",
    lg: direction === "vertical" ? "space-y-6" : "space-x-6",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };

  return (
    <div
      className={`
      flex ${directionClasses[direction]} ${spacingClasses[spacing]} ${alignClasses[align]}
      ${className}
    `}
    >
      {children}
    </div>
  );
}

// Accessible button group
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = "horizontal",
  size = "md",
  className = "",
}: ButtonGroupProps) {
  const orientationClasses = {
    horizontal: "flex-row mobile-stack",
    vertical: "flex-col",
  };

  return (
    <div
      className={`
        flex ${orientationClasses[orientation]} gap-2
        ${className}
      `}
      role="group"
      aria-label="Button group"
    >
      {children}
    </div>
  );
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Skip link for keyboard navigation
export function SkipLink({ href = "#main-content" }: { href?: string }) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-blue-600 text-white px-4 py-2 rounded-md z-50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
    >
      Skip to main content
    </a>
  );
}
