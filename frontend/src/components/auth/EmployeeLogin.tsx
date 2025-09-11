"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAsyncOperation } from "@/hooks/useLoadingApi";
import { api } from "@/services/api";
import { EnhancedLoadingButton } from "@/components/ui/EnhancedLoadingButton";
import { ParkingLoader } from "@/components/ui/ParkingLoader";

interface EmployeeLoginProps {
  onSuccess: () => void;
}

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(4, "Password must be at least 4 characters")
    .required("Password is required"),
});

export default function EmployeeLogin({ onSuccess }: EmployeeLoginProps) {
  const { execute } = useAsyncOperation();
  const [loginError, setLoginError] = useState<string>("");

  const handleLogin = async (values: LoginFormValues) => {
    setLoginError("");

    try {
      await execute(
        async () => {
          const payload = {
            email: values.email.trim(),
            password: values.password.trim(),
          };
          const response = await api.post("/auth/login", payload);
          const { user, token } = response.data;

          // Verify employee role
          if (user.role !== "employee" && user.role !== "admin") {
            throw new Error("Access denied. Employee credentials required.");
          }

          // Store token and user info
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          return response.data;
        },
        {
          loadingMessage: "Authenticating employee...",
          successMessage: "Authentication successful!",
          onSuccess: () => {
            setTimeout(onSuccess, 1000); // Small delay for success message
          },
          onError: (error) => {
            setLoginError(error.message);
          },
        }
      );
    } catch {
      // Error is handled by execute function
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 relative">
            <span className="text-white text-2xl font-bold">🅿️</span>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Employee Access
          </h2>
          <p className="text-gray-600">
            Sign in to access the checkout terminal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="employee@parkflow.com"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="Enter your password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Error Display */}
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-red-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-red-600">{loginError}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <EnhancedLoadingButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  loadingMessage="Signing in..."
                  successMessage="Access granted!"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14"
                      />
                    </svg>
                  }
                >
                  Sign In to Checkout Terminal
                </EnhancedLoadingButton>
              </Form>
            )}
          </Formik>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Demo Credentials:
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Employee:</strong> employee@parkflow.com / pass1
              </p>
              <p>
                <strong>Admin:</strong> admin@parkflow.com / pass1
              </p>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <ParkingLoader
            variant="compact"
            size="sm"
            message="Secure employee authentication"
          />
        </div>
      </div>
    </div>
  );
}
