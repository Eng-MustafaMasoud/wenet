"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface SmoothTransitionProps {
  children: ReactNode;
  className?: string;
  transitionKey?: string | number;
  duration?: number;
  type?: "fade" | "slide" | "scale" | "flip" | "custom";
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  stagger?: boolean;
  preserveScroll?: boolean;
}

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: (direction: string) => ({
      opacity: 0,
      x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
      y: direction === "up" ? -20 : direction === "down" ? 20 : 0,
    }),
    animate: { opacity: 1, x: 0, y: 0 },
    exit: (direction: string) => ({
      opacity: 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
    }),
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  flip: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function SmoothTransition({
  children,
  className = "",
  transitionKey,
  duration = 0.3,
  type = "fade",
  direction = "up",
  delay = 0,
  stagger = false,
  preserveScroll = true,
}: SmoothTransitionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);

    // Preserve scroll position if enabled
    if (preserveScroll && typeof window !== "undefined") {
      setScrollPosition(window.scrollY);
    }
  }, [preserveScroll]);

  useEffect(() => {
    // Restore scroll position after transition
    if (preserveScroll && typeof window !== "undefined" && scrollPosition > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, duration * 1000 + delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [scrollPosition, duration, delay, preserveScroll]);

  if (!isMounted) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${className}`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-2"
        >
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
          <div
            className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
        </motion.div>
      </div>
    );
  }

  const getTransitionProps = () => {
    const baseTransition = { duration, delay } as const;

    if (type === "custom") {
      return { transition: baseTransition };
    }

    const variant: any =
      transitionVariants[type as keyof typeof transitionVariants];
    const resolve = (v: any) => (typeof v === "function" ? v(direction) : v);

    return {
      initial: resolve(variant.initial),
      animate: resolve(variant.animate),
      exit: resolve(variant.exit),
      transition: baseTransition,
    };
  };

  const transitionProps = getTransitionProps();

  if (stagger) {
    return (
      <motion.div
        className={className}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={transitionKey || pathname || "default"}
            variants={staggerItem}
            {...transitionProps}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey || pathname || "default"}
        className={className}
        initial={(transitionProps as any).initial}
        animate={(transitionProps as any).animate}
        exit={(transitionProps as any).exit}
        transition={(transitionProps as any).transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Preset transition components for common use cases
export const FadeTransition = ({
  children,
  ...props
}: Omit<SmoothTransitionProps, "type">) => (
  <SmoothTransition type="fade" {...props}>
    {children}
  </SmoothTransition>
);

export const SlideTransition = ({
  children,
  ...props
}: Omit<SmoothTransitionProps, "type">) => (
  <SmoothTransition type="slide" {...props}>
    {children}
  </SmoothTransition>
);

export const ScaleTransition = ({
  children,
  ...props
}: Omit<SmoothTransitionProps, "type">) => (
  <SmoothTransition type="scale" {...props}>
    {children}
  </SmoothTransition>
);

export const FlipTransition = ({
  children,
  ...props
}: Omit<SmoothTransitionProps, "type">) => (
  <SmoothTransition type="flip" {...props}>
    {children}
  </SmoothTransition>
);

export const PageTransition = ({
  children,
  ...props
}: Omit<SmoothTransitionProps, "type" | "direction">) => (
  <SmoothTransition
    type="slide"
    direction="up"
    duration={0.4}
    stagger={false}
    {...props}
  >
    {children}
  </SmoothTransition>
);

export const ModalTransition = ({
  children,
  ...props
}: Omit<SmoothTransitionProps, "type">) => (
  <SmoothTransition type="scale" duration={0.2} {...props}>
    {children}
  </SmoothTransition>
);
