"use client";

import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  loadingMessage?: string;
  onClick?: () => void;
}

export const LoadingLink: React.FC<LoadingLinkProps> = ({
  href,
  children,
  className,
  loadingMessage = "Loading...",
  onClick,
}) => {
  const { showLoading } = useLoading();

  const handleClick = () => {
    showLoading(loadingMessage);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};
