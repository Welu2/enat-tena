"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface StepSupplementsProps {
  takingSupplements: boolean;
  setTakingSupplements: (val: boolean) => void;
  selectedSupplements: string[];
  toggleSupplement: (item: string) => void;
  otherSupplement: string;
  setOtherSupplement: (val: string) => void;
  onNoAnswer?: () => void;
}

export function StepSupplements({
  takingSupplements,
  setTakingSupplements,
  selectedSupplements,
  toggleSupplement,
  otherSupplement,
  setOtherSupplement,
  onNoAnswer,
}: StepSupplementsProps) {
  const { t } = useLanguage();
  
  // Local state for the text input box
  const [inputValue, setInputValue] = useState("");

  const supplementOptions = [
    { id: "Iron", label: t.iron },
    { id: "Folic Acid", label: t.folicAcid },
    { id: "Calcium", label: t.calcium },
    { id: "Vitamin D", label: t.vitaminD },
  ];

  // Parse comma-separated custom items from parent string
  const customItemsList = otherSupplement
    ? otherSupplement.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const handleAddCustomItem = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Avoid duplicate additions
    if (customItemsList.includes(trimmedInput)) {
      setInputValue("");
      return;
    }

    // 1. Add to the custom text pool string
    const updatedValue = otherSupplement ? `${otherSupplement}, ${trimmedInput}` : trimmedInput;
    setOtherSupplement(updatedValue);

    // 2. Automatically select the newly added custom item card
    if (!selectedSupplements.includes(trimmedInput)) {
      toggleSupplement(trimmedInput);
    }

    setInputValue(""); // Clear input box
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-brand-subtle uppercase">
          {t.step1Of3}
        </p>
        <h2 className="text-2xl font-bold text-brand-text mt-1">{t.supplementsTitle}</h2>
        <p className="text-xs sm:text-sm text-brand-subtle mt-1.5">
          {t.supplementsQuestion}
        </p>
      </div>

      {/* Yes / No Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTakingSupplements(true)}
          className={`py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
            takingSupplements
              ? "bg-brand-green text-white"
              : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:bg-[#F2ECE3]"
          }`}
        >
          {t.yes}
        </button>
        <button
          type="button"
          onClick={() => {
            setTakingSupplements(false);
            if (onNoAnswer) onNoAnswer();
          }}
          className={`py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
            !takingSupplements
              ? "bg-brand-green text-white"
              : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:bg-[#F2ECE3]"
          }`}
        >
          {t.no}
        </button>
      </div>

      {/* Checklist (Visible only if Yes) */}
      {takingSupplements && (
        <div className="space-y-2.5 pt-1">
          <p className="text-xs font-bold text-brand-text">{t.whichSupplements}</p>

          {/* Standard Supplement Cards */}
          {supplementOptions.map(({ id, label }) => {
            const isSelected = selectedSupplements.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleSupplement(id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-[#FAF7F2] border-2 border-brand-green text-brand-text"
                    : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:border-[#CCC2B2]"
                }`}
              >
                <span>{label}</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? "bg-brand-green" : "bg-[#D8D0C4]"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white stroke-current stroke-[3]" viewBox="0 0 24 24" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}

          {/* Newly Added Custom Supplement Cards (Rendered identically) */}
          {customItemsList.map((item) => {
            const isSelected = selectedSupplements.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleSupplement(item)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all animate-fadeIn ${
                  isSelected
                    ? "bg-[#FAF7F2] border-2 border-brand-green text-brand-text"
                    : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:border-[#CCC2B2]"
                }`}
              >
                <span>{item}</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? "bg-brand-green" : "bg-[#D8D0C4]"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white stroke-current stroke-[3]" viewBox="0 0 24 24" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}

          {/* Add Multiple Things Text Input Element */}
          <div className="relative flex items-center rounded-2xl bg-brand-input border border-[#E4DCD0] focus-within:ring-2 focus-within:ring-brand-green transition-all mt-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomItem();
                }
              }}
              placeholder={t.otherSupplementPlaceholder}
              className="w-full h-[50px] pl-4 pr-14 rounded-2xl bg-transparent text-brand-text placeholder-[#A3998C] text-sm focus:outline-none"
            />
            <button
              type="button"
              disabled={!inputValue.trim()}
              onClick={handleAddCustomItem}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                inputValue.trim() 
                  ? "bg-brand-green text-white scale-100 shadow-sm active:scale-95" 
                  : "bg-[#D8D0C4] text-white opacity-40 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
