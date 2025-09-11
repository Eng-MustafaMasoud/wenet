"use client";

import { useCallback } from "react";
import { useNotifications } from "@/components/ui/NotificationSystem";

interface ErrorDetails {
  message: string;
  code?: string | number;
  status?: number;
  context?: string;
  timestamp?: string;
}

export const useErrorHandler = () => {
  const notifications = useNotifications();

  const handleError = useCallback(
    (
      error: Error | string | any,
      context?: string,
      options?: {
        showToast?: boolean;
        logToConsole?: boolean;
        fallbackMessage?: string;
      }
    ) => {
      const {
        showToast = true,
        logToConsole = true,
        fallbackMessage = "An unexpected error occurred",
      } = options || {};

      let errorMessage: string;
      let errorCode: string | number | undefined;
      let errorStatus: number | undefined;

      // Extract error information
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        errorStatus = error.response.status;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else {
        errorMessage = fallbackMessage;
      }

      // Extract status code
      if (error?.response?.status) {
        errorStatus = error.response.status;
      } else if (error?.status) {
        errorStatus = error.status;
      }

      // Extract error code
      if (error?.code) {
        errorCode = error.code;
      } else if (error?.response?.data?.code) {
        errorCode = error.response.data.code;
      }

      // Create error details
      const errorDetails: ErrorDetails = {
        message: errorMessage,
        code: errorCode,
        status: errorStatus,
        context: context || "Unknown",
        timestamp: new Date().toISOString(),
      };

      // Log to console if enabled
      if (logToConsole) {
        console.error(`[${context || "ErrorHandler"}]`, errorDetails, error);
      }

      // Show toast notification if enabled
      if (showToast) {
        const title = getErrorTitle(errorStatus, errorCode);
        const message = getErrorMessage(errorMessage, errorStatus, errorCode);

        notifications.showError(title, message);
      }

      // Return error details for further handling
      return errorDetails;
    },
    [notifications]
  );

  const handleApiError = useCallback(
    (
      error: any,
      context: string = "API Request",
      options?: {
        showToast?: boolean;
        logToConsole?: boolean;
      }
    ) => {
      return handleError(error, context, {
        showToast: options?.showToast ?? true,
        logToConsole: options?.logToConsole ?? true,
        fallbackMessage: "API request failed",
      });
    },
    [handleError]
  );

  const handleValidationError = useCallback(
    (
      error: any,
      context: string = "Validation",
      options?: {
        showToast?: boolean;
        logToConsole?: boolean;
      }
    ) => {
      return handleError(error, context, {
        showToast: options?.showToast ?? true,
        logToConsole: options?.logToConsole ?? true,
        fallbackMessage: "Validation failed",
      });
    },
    [handleError]
  );

  const handleNetworkError = useCallback(
    (
      error: any,
      context: string = "Network",
      options?: {
        showToast?: boolean;
        logToConsole?: boolean;
      }
    ) => {
      return handleError(error, context, {
        showToast: options?.showToast ?? true,
        logToConsole: options?.logToConsole ?? true,
        fallbackMessage: "Network connection failed",
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleNetworkError,
  };
};

// Helper functions
const getErrorTitle = (status?: number, code?: string | number): string => {
  if (status === 401) return "Authentication Required";
  if (status === 403) return "Access Denied";
  if (status === 404) return "Not Found";
  if (status === 422) return "Validation Error";
  if (status === 429) return "Too Many Requests";
  if ((status ?? 0) >= 500) return "Server Error";
  if (code === "NETWORK_ERROR") return "Connection Error";
  if (code === "TIMEOUT") return "Request Timeout";
  return "Error";
};

const getErrorMessage = (
  message: string,
  status?: number,
  code?: string | number
): string => {
  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }
  if (status === 403) {
    return "You don't have permission to perform this action. Please contact your administrator if you believe this is an error.";
  }
  if (status === 404) {
    return "The requested resource was not found.";
  }
  if (status === 422) {
    return message || "Please check your input and try again.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if ((status ?? 0) >= 500) {
    return "Something went wrong on our end. Please try again later.";
  }
  if (code === "NETWORK_ERROR") {
    return "Please check your internet connection and try again.";
  }
  if (code === "TIMEOUT") {
    return "The request took too long. Please try again.";
  }
  return message || "An unexpected error occurred. Please try again.";
};
