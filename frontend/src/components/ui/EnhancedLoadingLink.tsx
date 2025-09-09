"use client";

import React from "react";
import Link from "next/link";
import { useLoadingRouter } from "@/hooks/useLoadingApi";

interface EnhancedLoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  prefetch?: boolean;
  loadingMessage?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const EnhancedLoadingLink: React.FC<EnhancedLoadingLinkProps> = ({
  href,
  children,
  className = "",
  replace = false,
  scroll,
  shallow,
  prefetch,
  loadingMessage = "Navigating...",
  onClick,
  ...props
}) => {
  const { push, replace: routerReplace } = useLoadingRouter();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) {
        return;
      }
    }

    // Don't intercept external links, mailto, tel, etc.
    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    // Don't intercept if opening in new tab
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return;
    }

    e.preventDefault();

    try {
      if (replace) {
        await routerReplace(href, { scroll, shallow });
      } else {
        await push(href, { scroll, shallow });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to regular navigation
      window.location.href = href;
    }
  };

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`transition-all duration-200 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default EnhancedLoadingLink;
