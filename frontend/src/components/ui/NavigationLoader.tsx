"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setIsNavigating(true);
      setPrevPath(pathname);
      const timer = setTimeout(() => setIsNavigating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          className="fixed top-16 left-0 right-0 z-50 origin-left"
          transition={{ duration: 0.2 }}
        >
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
