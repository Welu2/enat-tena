"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: integrate with error reporting (e.g., Sentry)
    }
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center min-h-dvh">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-[#F8EEEE] text-[#963838] flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-extrabold text-brand-text">
        Something went wrong
      </h1>
      <p className="text-sm text-brand-subtle mt-2 max-w-[280px]">
        An unexpected error occurred. Please try again.
      </p>

      {error.digest && (
        <p className="text-[10px] text-brand-subtle mt-3 font-mono">
          Error ID: {error.digest}
        </p>
      )}

      <button
        type="button"
        onClick={retry}
        className="mt-8 min-h-[48px] px-8 py-3 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all"
      >
        Try Again
      </button>
    </main>
  );
}
