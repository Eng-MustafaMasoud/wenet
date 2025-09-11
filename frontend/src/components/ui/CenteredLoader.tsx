"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CenteredLoaderProps {
  isLoading: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
  overlay?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export default function CenteredLoader({
  isLoading,
  message = "Loading...",
  size = "md",
  overlay = true,
}: CenteredLoaderProps) {
  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`${
          overlay
            ? "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
            : "flex items-center justify-center"
        }`}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <div
              className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
            />
          </div>
          {message && (
            <p className="text-sm text-gray-600 font-medium">{message}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

