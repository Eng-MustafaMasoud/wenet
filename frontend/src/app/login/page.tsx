import { Suspense } from "react";
import LoginPageWrapper from "@/components/auth/LoginPageWrapper";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="animate-pulse text-gray-600">Loading login…</div>
        </div>
      }
    >
      <LoginPageWrapper />
    </Suspense>
  );
}
