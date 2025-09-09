"use client";

import React, { useState } from "react";
import { useAsyncOperation } from "@/hooks/useLoadingApi";
import { ParkingLoader } from "./ParkingLoader";

interface EnhancedLoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asyncOnClick?: () => Promise<void>;
  loadingMessage?: string;
  successMessage?: string;
  showProgress?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loadingIcon?: React.ReactNode;
}

export const EnhancedLoadingButton: React.FC<EnhancedLoadingButtonProps> = ({
  children,
  asyncOnClick,
  loadingMessage = "Processing...",
  successMessage,
  showProgress = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  loadingIcon,
  disabled,
  onClick,
  className = "",
  ...props
}) => {
  const { execute } = useAsyncOperation();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const getVariantClasses = () => {
    const baseClasses =
      "font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

    switch (variant) {
      case "primary":
        return `${baseClasses} bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:ring-blue-500`;
      case "secondary":
        return `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500`;
      case "success":
        return `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 focus:ring-green-500`;
      case "danger":
        return `${baseClasses} bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500`;
      case "warning":
        return `${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500`;
      default:
        return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-sm";
      case "lg":
        return "px-8 py-4 text-lg";
      default:
        return "px-6 py-3 text-base";
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (asyncOnClick) {
      e.preventDefault();
      setIsLocalLoading(true);

      try {
        await execute(asyncOnClick, {
          loadingMessage,
          successMessage,
          showProgress,
          onSuccess: () => setIsLocalLoading(false),
          onError: () => setIsLocalLoading(false),
        });
      } catch (error) {
        setIsLocalLoading(false);
        // Error is handled by the execute function
      }
    } else if (onClick) {
      onClick(e);
    }
  };

  const isDisabled = disabled || isLocalLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? "w-full" : ""}
        ${isLocalLoading ? "cursor-wait" : ""}
        ${className}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        {isLocalLoading ? (
          <>
            {loadingIcon || (
              <ParkingLoader
                variant="compact"
                size="sm"
                type={
                  variant === "danger"
                    ? "error"
                    : variant === "warning"
                    ? "warning"
                    : variant === "success"
                    ? "success"
                    : "default"
                }
              />
            )}
            <span>{loadingMessage}</span>
          </>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </div>
    </button>
  );
};

export default EnhancedLoadingButton;
