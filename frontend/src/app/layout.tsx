import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/design-system.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import PWAProvider from "@/components/providers/PWAProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ApiInterceptorProvider } from "@/components/providers/ApiInterceptorProvider";
import { NavigationLoadingProvider } from "@/components/providers/NavigationLoadingProvider";
import GlobalLoadingProvider from "@/components/providers/LoadingProvider";
import PageTransition from "@/components/ui/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "ParkFlow - Parking Management System",
  description: "A comprehensive parking reservation and management system",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ParkFlow",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans" suppressHydrationWarning={true}>
        <ReduxProvider>
          <QueryProvider>
            <LoadingProvider>
              <GlobalLoadingProvider>
                <ApiInterceptorProvider>
                  <NavigationLoadingProvider>
                    <PWAProvider>
                      <PageTransition>{children}</PageTransition>
                    </PWAProvider>
                  </NavigationLoadingProvider>
                </ApiInterceptorProvider>
              </GlobalLoadingProvider>
            </LoadingProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
