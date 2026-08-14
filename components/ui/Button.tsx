"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Renders as a full-width block button */
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-green hover:bg-brand-green-hover text-white shadow-sm",
  secondary:
    "bg-[#E2DBD0] hover:bg-[#D8D0C3] text-brand-text",
  danger:
    "bg-[#963838] hover:bg-[#7E2E2E] text-white",
  ghost:
    "bg-transparent hover:bg-black/5 text-brand-text",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-4 py-2 text-xs rounded-xl",
  md: "min-h-[48px] px-5 py-3 text-sm rounded-2xl",
  lg: "min-h-[50px] px-6 py-3.5 sm:py-4 text-sm sm:text-base rounded-2xl",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Button({
  variant = "primary",
  size = "lg",
  isLoading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        font-semibold transition-all active:scale-[0.98]
        disabled:opacity-50 disabled:pointer-events-none
        flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
