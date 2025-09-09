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
      const response = await loginMutation.mutateAsync(values);
      dispatch(loginSuccess(response));
      dispatch(
        addNotification({
          type: "success",
          message: `Welcome back, ${response.user.username}!`,
        })
      );

      // Redirect based on role
      if (response.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/checkpoint");
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative">
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
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="animate-spin h-8 w-8 text-white"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Signing you in...
                      </h3>
                      <p className="text-sm text-gray-500">
                        Please wait while we authenticate your credentials
                      </p>
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
                  />

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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
