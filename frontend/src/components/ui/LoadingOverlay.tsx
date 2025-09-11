"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export default function LoadingOverlay({
  isLoading,
  message = "Loading...",
  showProgress = false,
  progress = 0,
  className = "",
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center ${className}`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4"
          >
            {/* Spinner */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-blue-600" />
              </motion.div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {message}
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we process your request...
              </p>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Loading Dots Animation */}
            <div className="flex justify-center mt-6 space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
