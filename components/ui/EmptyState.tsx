import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fadeIn">
      {icon && (
        <div className="w-16 h-16 rounded-3xl bg-[#EBE5DA] text-[#8C7A6B] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-brand-text">{title}</h3>
      {description && (
        <p className="text-xs text-brand-subtle mt-1.5 max-w-[260px]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
