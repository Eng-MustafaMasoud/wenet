"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Formik, Form } from "formik";
import { useLogin } from "@/hooks/useApi";
import { loginSuccess, loginFailure } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { loginSchema } from "@/utils/validation";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

interface LoginFormProps {
  redirectTo?: string;
}

function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const loginMutation = useLogin();

  const handleSubmit = async (
    values: { username: string; password: string },
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      // Trim whitespace from credentials
      const trimmedValues = {
        username: values.username.trim(),
        password: values.password.trim(),
      };

      const response = await loginMutation.mutateAsync(trimmedValues);
      dispatch(loginSuccess(response));
      dispatch(
        addNotification({
          type: "success",
          message: `Welcome back, ${response.user.username}!`,
        })
      );

      // Add smooth transition delay before redirect
      setTimeout(() => {
        // Redirect based on role
        if (response.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/checkpoint");
        }
      }, 800); // Small delay for smooth transition
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Login failed. Please try again.";
      setFieldError("password", errorMessage);
      dispatch(loginFailure(errorMessage));
      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative no-flicker">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to ParkFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your parking management system
          </p>
        </div>

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <>
              {/* Full Page Loading Overlay */}
              {isSubmitting && (
                <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 to-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ease-out">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="text-center">
                      <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                        {/* Rotating outer ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/30 border-r-white/20 animate-spin"></div>

                        {/* Inner lock icon with pulse */}
                        <div className="relative z-10 p-2">
                          <svg
                            className="h-8 w-8 text-white animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </div>

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 animate-pulse">
                        Authenticating...
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Verifying your credentials securely
                      </p>

                      {/* Progress dots */}
                      <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Form className="mt-8 space-y-6">
                <div className="space-y-4">
                  <FormField
                    name="username"
                    label="Username"
                    type="text"
                    required
                    placeholder="Enter your username"
                  >
                    {({ field }: any) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Enter your username"
                        onBlur={(e) => {
                          const trimmed = e.target.value.trim();
                          if (trimmed !== e.target.value) {
                            e.target.value = trimmed;
                          }
                          field.onBlur(e);
                        }}
                        className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 text-gray-900"
                      />
                    )}
                  </FormField>

                  <FormField
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                  >
                    {({ field }: any) => (
                      <div className="relative">
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          onBlur={(e) => {
                            const trimmed = e.target.value.trim();
                            if (trimmed !== e.target.value) {
                              e.target.value = trimmed;
                            }
                            field.onBlur(e);
                          }}
                          className="block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 text-gray-900"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </FormField>
                </div>

                {errors.password && touched.password && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{errors.password}</span>
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 btn-smooth preserve-dimensions disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign in
                      </div>
                    )}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LoginForm;
