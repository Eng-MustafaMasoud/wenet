"use client";

import { api } from "./api";

let activeRequests = 0;
let loadingCallback: ((isLoading: boolean, message?: string) => void) | null =
  null;

// Set up the loading callback (called from a component that has access to loading context)
export const setupApiInterceptors = (
  showLoading: (message?: string) => void,
  hideLoading: () => void
) => {
  loadingCallback = (isLoading: boolean, message?: string) => {
    if (isLoading) {
      showLoading(message);
    } else {
      hideLoading();
    }
  };

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      activeRequests++;
      if (activeRequests === 1 && loadingCallback) {
        // Determine message based on method and URL
        let message = "Loading...";
        if (config.method?.toLowerCase() === "post") {
          message = "Creating...";
        } else if (
          config.method?.toLowerCase() === "put" ||
          config.method?.toLowerCase() === "patch"
        ) {
          message = "Updating...";
        } else if (config.method?.toLowerCase() === "delete") {
          message = "Deleting...";
        } else if (config.url?.includes("login")) {
          message = "Signing in...";
        } else if (config.url?.includes("checkin")) {
          message = "Processing check-in...";
        } else if (config.url?.includes("checkout")) {
          message = "Processing check-out...";
        }

        loadingCallback(true, message);
      }
      return config;
    },
    (error) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0 && loadingCallback) {
        loadingCallback(false);
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0 && loadingCallback) {
        loadingCallback(false);
      }
      return response;
    },
    (error) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0 && loadingCallback) {
        loadingCallback(false);
      }
      return Promise.reject(error);
    }
  );
};

// Clean up function
export const cleanupApiInterceptors = () => {
  loadingCallback = null;
  activeRequests = 0;
};
