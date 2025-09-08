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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
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
                        className="block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
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
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LoginForm;
