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
import ClientOnly from "@/components/ui/ClientOnly";

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
    <html lang="en" className={inter.variable} suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration issues
              (function() {
                if (typeof window !== 'undefined') {
                  const removeExtensionAttributes = () => {
                    const body = document.body;
                    if (body) {
                      // Remove common extension attributes
                      body.removeAttribute('cz-shortcut-listen');
                      body.removeAttribute('data-new-gr-c-s-check-loaded');
                      body.removeAttribute('data-gr-ext-installed');
                      body.removeAttribute('data-gramm_editor');
                    }
                  };
                  
                  // Run immediately
                  removeExtensionAttributes();
                  
                  // Run after DOM is ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', removeExtensionAttributes);
                  }
                  
                  // Run after a short delay to catch late-loading extensions
                  setTimeout(removeExtensionAttributes, 100);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning={true}>
        <ClientOnly>
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
        </ClientOnly>
      </body>
    </html>
  );
}
