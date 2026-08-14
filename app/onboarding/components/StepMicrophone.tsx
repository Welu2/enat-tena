"use client";

import { useLanguage } from "@/context/LanguageContext";

interface StepMicrophoneProps {
  micState: "prompt" | "granted" | "denied";
}

export function StepMicrophone({ micState }: StepMicrophoneProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-brand-subtle uppercase">
          {t.step3Of3}
        </p>
        <h2 className="text-2xl font-bold text-brand-text mt-1">{t.micTitle}</h2>
        <p className="text-xs sm:text-sm text-brand-subtle mt-1.5 leading-relaxed">
          {t.micDescription}
        </p>
      </div>

      {/* Microphone Icon Display */}
      <div className="flex justify-center py-4">
        <div
          className={`w-28 h-28 rounded-3xl flex items-center justify-center border transition-all ${
            micState === "denied"
              ? "bg-[#F7EFEF] border-red-200 text-[#A63A3A]"
              : "bg-[#EAE4D8] border-[#DECAB8] text-[#855B3E]"
          }`}
        >
          <svg className="w-12 h-12 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
            <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Denied Warning Notification */}
      {micState === "denied" && (
        <div className="p-4 bg-[#F8EEEE] border border-[#ECD1D1] rounded-2xl text-center space-y-1">
          <p className="text-sm font-bold text-[#963838]">{t.micDeniedTitle}</p>
          <p className="text-xs text-[#804242]">{t.micDeniedGuide}</p>
        </div>
      )}
    </div>
  );
}