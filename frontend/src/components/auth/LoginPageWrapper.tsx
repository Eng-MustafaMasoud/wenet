"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "./LoginForm";

export default function LoginPageWrapper() {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {/* Parking-themed loading icon */}
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative">
              <div className="w-8 h-6 bg-white rounded-sm opacity-80"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-spin">
                <div className="w-3 h-0.5 bg-blue-500 rounded-full transform origin-left"></div>
              </div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-500 text-xs font-bold">P</span>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Sign in to ParkFlow
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your parking management system
            </p>
          </div>
          <div className="animate-pulse">
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                    suppressHydrationWarning={true}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                    suppressHydrationWarning={true}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {reason && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            {reason === "unauthorized" && (
              <p>
                Your session has expired or you are not logged in. Please sign
                in to continue.
              </p>
            )}
            {reason === "forbidden" && (
              <p>
                Access denied. Please sign in with an account that has
                permission to view that page.
              </p>
            )}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
