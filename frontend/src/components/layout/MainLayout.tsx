"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { classNames } from "@/utils/helpers";
import { motion } from "framer-motion";

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
    <div className="min-h-screen mobile-scroll-fix bg-gray-50">
      {/* Navigation Header */}
      <Navigation
        title={title}
        showConnectionStatus={showConnectionStatus}
        gateId={gateId}
        sidebarCollapsed={sidebarCollapsed}
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
          // Mobile: no sidebar margin (sidebar overlay)
          "ml-0"
        )}
      >
        <main className="pt-16">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb />
          </div>

          {/* Page Content */}
          <motion.div
            className="px-4 sm:px-6 lg:px-8 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
