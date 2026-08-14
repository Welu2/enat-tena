"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  /** Show password toggle for type="password" */
  showToggle?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Input({
  label,
  error,
  showToggle = false,
  type = "text",
  className = "",
  id,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType =
    isPassword && showToggle && showPassword ? "text" : type;

  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-bold text-brand-text"
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        <input
          id={inputId}
          type={resolvedType}
          className={`
            w-full min-h-[48px] px-4 py-3 sm:py-3.5
            rounded-2xl bg-brand-input border border-[#E4DCD0]
            text-brand-text placeholder-[#A3998C] text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-green
            transition-colors
            ${isPassword && showToggle ? "pr-12" : ""}
            ${error ? "border-red-300 focus:ring-red-400" : ""}
            ${className}
          `.trim()}
          {...rest}
        />

        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3998C] hover:text-brand-text transition-colors focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
