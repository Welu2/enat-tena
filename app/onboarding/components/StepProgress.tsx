"use client";

import { useLanguage } from "@/context/LanguageContext";
import { getOnboardingText } from "@/lib/translations/onboarding";
import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const { lang } = useLanguage();
  const t = getOnboardingText(lang);

  const stepsList = [
    { num: 1, label: t.steps.step1 },
    { num: 2, label: t.steps.step2 },
    { num: 3, label: t.steps.step3 },
    { num: 4, label: t.steps.step4 },
  ];

  return (
    <div className="w-full mb-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E8E1D5] -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#2D6A4F] -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />

        {stepsList.map((s) => {
          const isCompleted = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted
                    ? "bg-[#2D6A4F] text-white"
                    : isCurrent
                    ? "bg-[#2D6A4F] text-white ring-4 ring-[#C8E1D3]"
                    : "bg-[#F4EFE6] text-[#7A7165] border border-[#E8E1D5]"
                }`}
              >
                {isCompleted ? <Check size={14} /> : s.num}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs font-bold text-[#2D6A4F]">
          {stepsList[currentStep - 1].label}
        </span>
        <span className="text-xs text-[#7A7165] ml-1.5">({currentStep}/4)</span>
      </div>
    </div>
  );
}