"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade" | "slide" | "scale" | "blur";
  duration?: number;
  delay?: number;
}

export default function PageTransition({
  children,
  className = "",
  animation = "fade",
  duration = 300,
  delay = 0,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // If pathname changed, trigger exit animation
    if (prevPathnameRef.current !== pathname) {
      setIsVisible(false);
      setTimeout(() => {
        setShouldRender(false);
        setTimeout(() => {
          setShouldRender(true);
          prevPathnameRef.current = pathname;
          setTimeout(() => setIsVisible(true), 50);
        }, duration);
      }, duration);
    } else {
      // Initial load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [pathname, duration, delay]);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-out`;

    switch (animation) {
      case "fade":
        return `${baseClasses} ${isVisible ? "opacity-100" : "opacity-0"}`;
      case "slide":
        return `${baseClasses} ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`;
      case "scale":
        return `${baseClasses} ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`;
      case "blur":
        return `${baseClasses} ${
          isVisible ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        }`;
      default:
        return baseClasses;
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`${getAnimationClasses()} ${className}`}>{children}</div>
  );
}

// Staggered animations for child elements
export function StaggeredChildren({
  children,
  stagger = 100,
  animation = "slide",
}: {
  children: React.ReactNode[];
  stagger?: number;
  animation?: "slide" | "fade" | "scale";
}) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    children.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, index]));
      }, index * stagger);
    });
  }, [children, stagger]);

  const getItemClasses = (index: number) => {
    const isVisible = visibleItems.has(index);

    switch (animation) {
      case "slide":
        return `transition-all duration-500 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`;
      case "fade":
        return `transition-all duration-500 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`;
      case "scale":
        return `transition-all duration-500 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`;
      default:
        return "";
    }
  };

  return (
    <>
      {children.map((child, index) => (
        <div key={index} className={getItemClasses(index)}>
          {child}
        </div>
      ))}
    </>
  );
}

// Route transition hook
export function usePageTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateWithTransition = (path: string, delay: number = 200) => {
    setIsTransitioning(true);

    // Add exit animation class to body
    document.body.classList.add("page-transitioning");

    setTimeout(() => {
      router.push(path);

      // Remove transition class after navigation
      setTimeout(() => {
        setIsTransitioning(false);
        document.body.classList.remove("page-transitioning");
      }, 100);
    }, delay);
  };

  return { navigateWithTransition, isTransitioning };
}

// Smooth scroll to top on route change
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [pathname]);

  return null;
}

// Loading transition between pages
export function LoadingTransition({
  isLoading,
  children,
  loadingContent,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingContent?: React.ReactNode;
}) {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      const timer = setTimeout(() => setShowContent(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="relative">
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isLoading ? "opacity-100 z-10" : "opacity-0 -z-10"
        }`}
      >
        {loadingContent}
      </div>

      {/* Content */}
      <div
        className={`transition-all duration-300 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
