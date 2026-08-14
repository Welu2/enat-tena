"use client";

import { useState, useEffect } from "react";

interface Props {
  title: string;
  subtitle?: string;
  onSave?: (newTitle: string, newSubtitle: string) => void;
  onDelete?: () => void;
}

export function UnderstoodItem({ title, subtitle = "", onSave, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);

  // Sync state if props change externally
  useEffect(() => {
    setCurrentTitle(title);
    setCurrentSubtitle(subtitle);
  }, [title, subtitle]);

  const handleSave = () => {
    if (!currentTitle.trim()) return;
    setIsEditing(false);
    if (onSave) {
      onSave(currentTitle.trim(), currentSubtitle.trim());
    }
  };

  const handleCancel = () => {
    setCurrentTitle(title);
    setCurrentSubtitle(subtitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-2xl transition-all shadow-xs">
      {!isEditing ? (
        /* ================= Normal View Mode ================= */
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-brand-text truncate">{currentTitle}</h4>
            {currentSubtitle && (
              <p className="text-xs text-brand-subtle mt-0.5 truncate">{currentSubtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit item"
              className="w-8 h-8 rounded-xl bg-[#EFE9DF] text-[#7A7062] hover:text-brand-text hover:bg-[#E4DCD0] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete item"
                className="w-8 h-8 rounded-xl bg-[#F8EEEE] text-[#963838] hover:bg-[#FBEAEA] flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ================= Inline Editing Mode ================= */
        <div className="space-y-2.5">
          <div className="space-y-2">
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title / Symptom..."
              autoFocus
              className="w-full bg-white border border-[#D5CCC0] rounded-xl px-3 py-1.5 text-xs text-brand-text font-bold focus:outline-none focus:border-brand-green"
            />
            <input
              type="text"
              value={currentSubtitle}
              onChange={(e) => setCurrentSubtitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Duration / Details (optional)..."
              className="w-full bg-white border border-[#D5CCC0] rounded-xl px-3 py-1.5 text-xs text-brand-subtle focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 rounded-xl bg-[#EBE5DA] text-brand-text text-xs font-semibold hover:bg-[#DDD5C7] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-green-hover transition-all cursor-pointer shadow-xs"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}