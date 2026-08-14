"use client";

import React, { useCallback, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 animate-fadeIn" />

      {/* Panel */}
      <div className="relative w-full sm:max-w-[400px] bg-brand-cream rounded-t-3xl sm:rounded-3xl p-6 animate-slideUp max-h-[85dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-bold text-brand-text">{title}</h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#EFE9DF] text-[#7A7062] hover:text-brand-text flex items-center justify-center transition-colors ml-auto"
            aria-label="Close"
          >
            <svg
              className="w-4 h-4 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
