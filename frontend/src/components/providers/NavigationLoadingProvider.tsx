"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

const NavigationLoadingHandler: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hideLoading } = useLoading();

  useEffect(() => {
    // Hide loading when navigation is complete
    hideLoading();
  }, [pathname, searchParams, hideLoading]);

  return null;
};

export const NavigationLoadingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationLoadingHandler />
      </Suspense>
      {children}
    </>
  );
};
