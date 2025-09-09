"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { EnhancedLoadingButton } from "@/components/ui/EnhancedLoadingButton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import EmployeeLogin from "@/components/auth/EmployeeLogin";
import CheckoutInterface from "@/components/checkout/CheckoutInterface";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [isEmployeeAuthenticated, setIsEmployeeAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has employee role
    if (isAuthenticated && user) {
      if (user.role === "employee" || user.role === "admin") {
        setIsEmployeeAuthenticated(true);
      } else {
        // Redirect non-employees
        router.push("/dashboard");
      }
    }
    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  const handleEmployeeLogin = () => {
    setIsEmployeeAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingCard
          message="Loading checkout system..."
          type="default"
          size="lg"
        />
      </div>
    );
  }

  if (!isEmployeeAuthenticated) {
    return <EmployeeLogin onSuccess={handleEmployeeLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">🅿️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ParkFlow Checkout
                </h1>
                <p className="text-gray-600">Employee Checkout Terminal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium text-gray-900">
                  {user?.username || "Employee"}
                </p>
              </div>
              <EnhancedLoadingButton
                variant="secondary"
                size="sm"
                onClick={() => router.push("/dashboard")}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                }
              >
                Back to Dashboard
              </EnhancedLoadingButton>
            </div>
          </div>
        </div>

        {/* Main Checkout Interface */}
        <CheckoutInterface />
      </div>
    </div>
  );
}
