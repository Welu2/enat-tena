"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: ToggleProps) {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div className="flex-1 mr-3">
          {label && (
            <label
              htmlFor={toggleId}
              className="text-xs font-bold text-brand-text cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-brand-subtle">{description}</p>
          )}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          w-11 h-6 rounded-full p-1 transition-colors shrink-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? "bg-brand-green" : "bg-[#DDD5C7]"}
        `.trim()}
      >
        <div
          className={`
            w-4 h-4 rounded-full bg-white transition-transform
            ${checked ? "translate-x-5" : "translate-x-0"}
          `.trim()}
        />
      </button>
    </div>
  );
}
