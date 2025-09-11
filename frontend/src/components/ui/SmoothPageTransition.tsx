"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SmoothPageTransition as SmoothTransition } from "./AntiFlickerSystem";

interface SmoothPageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function SmoothPageTransition({
  children,
  className = "",
}: SmoothPageTransitionProps) {
  const pathname = usePathname();

  return (
    <SmoothTransition
      transitionKey={pathname || "default"}
      className={className}
    >
      {children}
    </SmoothTransition>
  );
}
