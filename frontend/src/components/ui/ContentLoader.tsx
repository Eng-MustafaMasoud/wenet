"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContentLoaderProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  className?: string;
}

export default function ContentLoader({
  children,
  isLoading = false,
  loadingMessage = "Loading...",
  className = "",
}: ContentLoaderProps) {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      // Add a small delay to prevent flicker
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading || !showContent ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px] flex items-center justify-center"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">{loadingMessage}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
