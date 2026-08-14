"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);

      // Auto-dismiss
      setTimeout(() => removeToast(id), TOAST_DURATION);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Render Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Toast Container (renders all active toasts)
// ---------------------------------------------------------------------------

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90vw] max-w-[380px] pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto animate-slideDown rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-start gap-3 ${variantStyles[toast.variant]}`}
        >
          <span className="text-sm flex-1 font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-current opacity-60 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
            aria-label="Dismiss"
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
      ))}
    </div>
  );
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-[#2B5140]/95 text-white",
  error: "bg-[#963838]/95 text-white",
  warning: "bg-[#8B6914]/95 text-white",
  info: "bg-[#3A3530]/95 text-white",
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
