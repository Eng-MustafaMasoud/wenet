"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export default function TopProgressBar() {
  const pathname = usePathname();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [previousPathname, setPreviousPathname] = useState(pathname);

  // const isLoading = isFetching > 0 || isMutating > 0 || isNavigating;

  // Handle navigation progress by detecting pathname changes
  useEffect(() => {
    if (pathname !== previousPathname) {
      // Navigation started
      setIsNavigating(true);
      setIsVisible(true);
      setProgress(0);
      setPreviousPathname(pathname);

      // Simulate navigation progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 80);

      // Complete navigation after a reasonable delay
      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsVisible(false);
          setIsNavigating(false);
          setProgress(0);
        }, 200);
        clearInterval(interval);
      }, 300);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [pathname, previousPathname]);

  // Handle data fetching progress
  useEffect(() => {
    if (isFetching > 0 || isMutating > 0) {
      setIsVisible(true);

      // Simulate progress for better UX
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (isVisible && !isNavigating) {
      // Complete the progress bar
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
    }
  }, [isFetching, isMutating, isVisible, isNavigating]);

  // Start progress on in-app link clicks for immediate feedback
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      let el: HTMLElement | null = target;
      while (el && el.tagName !== "A") {
        el = el.parentElement;
      }
      if (!el) return;
      const anchor = el as HTMLAnchorElement;
      const href = anchor.getAttribute("href") || "";
      if (
        !href ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // In-app navigation
        setIsVisible(true);
        setIsNavigating(true);
        setProgress(0);
      } catch {
        // ignore invalid URL
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[10000] h-1 bg-gradient-to-r from-blue-500 to-blue-600 origin-left"
          style={{
            transform: `scaleX(${progress / 100})`,
          }}
        >
          <div className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
