"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { useAsyncOperation } from "@/hooks/useLoadingApi";
import Button from "./Button";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  loadingMessage?: string;
  asyncOnClick?: () => Promise<void>;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loadingMessage = "Processing...",
      asyncOnClick,
      onClick,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { execute } = useAsyncOperation();

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (asyncOnClick) {
        await execute(asyncOnClick, loadingMessage);
      } else if (onClick) {
        onClick(event);
      }
    };

    return (
      <Button {...props} onClick={handleClick} disabled={disabled} ref={ref}>
        {children}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;
