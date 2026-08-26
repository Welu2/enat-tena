"use client";

import { useLanguage } from "@/context/LanguageContext";
import { getOnboardingText } from "@/lib/translations/onboarding";
import { StepComponentProps } from "../types";
import { Mic, Pill } from "lucide-react";

export function StepSupplementsAndMic({ data, updateData }: StepComponentProps) {
  const { lang } = useLanguage();
  const t = getOnboardingText(lang);

  const toggleSupplement = (name: string) => {
    const list = data.selectedSupplements;
    if (list.includes(name)) {
      updateData({ selectedSupplements: list.filter((n) => n !== name) });
    } else {
      updateData({ selectedSupplements: [...list, name] });
    }
  };

  const supplementOptions = [
    { key: "iron & folic acid", label: t.step4.supplements.ifa },
    { key: "calcium", label: t.step4.supplements.calcium },
    { key: "multiple micronutrients", label: t.step4.supplements.mmn },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#2C2723]">{t.step4.title}</h3>
        <p className="text-xs text-[#7A7165] mt-0.5">{t.step4.subtitle}</p>
      </div>

      {/* Taking Supplements Toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5]">
        <span className="text-xs font-semibold text-[#2C2723] flex items-center gap-2">
          <Pill size={16} className="text-[#2D6A4F]" />
          {t.step4.takingSupplementsLabel}
        </span>
        <button
          type="button"
          onClick={() => updateData({ takingSupplements: !data.takingSupplements })}
          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
            data.takingSupplements ? "bg-[#2D6A4F]" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              data.takingSupplements ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Supplement Checklist */}
      {data.takingSupplements && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <label className="text-xs font-semibold text-[#2C2723]">
            {t.step4.supplementsListLabel}
          </label>
          <div className="space-y-1.5">
            {supplementOptions.map((opt) => {
              const isSelected = data.selectedSupplements.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleSupplement(opt.key)}
                  className={`w-full p-2.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "border-[#2D6A4F] bg-[#F0F7F3] font-bold text-[#2D6A4F]"
                      : "border-[#E8E1D5] bg-[#F8F5EE] text-[#2C2723]"
                  }`}
                >
                  <span>{opt.label}</span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      isSelected ? "bg-[#2D6A4F] border-[#2D6A4F] text-white" : "border-gray-400"
                    }`}
                  >
                    {isSelected && "✓"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Microphone Permission Info Card */}
      <div className="p-4 rounded-3xl bg-[#F0F7F3] border border-[#C8E1D3] space-y-2 mt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center">
            <Mic size={16} />
          </div>
          <span className="text-xs font-bold text-[#2D6A4F]">
            {t.step4.micCardTitle}
          </span>
        </div>
        <p className="text-xs text-[#2C2723] leading-relaxed">
          {t.step4.micCardDesc}
        </p>
      </div>
    </div>
  );
}