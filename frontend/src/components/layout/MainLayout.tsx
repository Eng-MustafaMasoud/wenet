"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { classNames } from "@/utils/helpers";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showConnectionStatus?: boolean;
  gateId?: string;
}

export default function MainLayout({
  children,
  title,
  showConnectionStatus = false,
  gateId,
}: MainLayoutProps) {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Navigation
        title={title}
        showConnectionStatus={showConnectionStatus}
        gateId={gateId}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={classNames(
          "transition-all duration-300 ease-in-out",
          // Desktop: adjust based on sidebar collapsed state
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
          // Mobile: adjust based on sidebar open state
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <main className="min-h-screen pt-16">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb />
          </div>

          {/* Page Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
