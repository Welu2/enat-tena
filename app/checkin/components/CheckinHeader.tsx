"use client";

import { useLanguage } from "@/context/LanguageContext";

interface Props {
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
}

export function CheckinHeader({ currentStep, totalSteps = 4, onBack }: Props) {
  const { lang, setLang } = useLanguage();

  return (
    <div className="w-full flex items-center justify-between pt-4 pb-2">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E4DCD0] flex items-center justify-center text-brand-text active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-bold text-brand-subtle tracking-wider">
          {currentStep} / {totalSteps}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="flex-1 max-w-[140px] mx-3 flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              currentStep >= s ? "bg-brand-green" : "bg-[#DDD5C7]"
            }`}
          />
        ))}
      </div>

      {/* Language Switch */}
      <div className="inline-flex bg-[#E0D8CA] p-0.5 rounded-xl border border-[#D5CDBD]">
        <button
          type="button"
          onClick={() => setLang("am")}
          className={`px-2 py-0.5 text-[11px] font-bold rounded-lg ${
            lang === "am" ? "bg-brand-green text-white" : "text-brand-subtle"
          }`}
        >
          አም
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-2 py-0.5 text-[11px] font-bold rounded-lg ${
            lang === "en" ? "bg-brand-green text-white" : "text-brand-subtle"
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}