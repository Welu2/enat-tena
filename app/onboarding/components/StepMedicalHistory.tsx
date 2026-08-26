"use client";

import { useLanguage } from "@/context/LanguageContext";
import { getOnboardingText } from "@/lib/translations/onboarding";
import { StepComponentProps } from "../types";

export function StepMedicalHistory({ data, updateData }: StepComponentProps) {
  const { lang } = useLanguage();
  const t = getOnboardingText(lang);

  const toggleCondition = (key: string) => {
    const list = data.knownConditions;
    if (list.includes(key)) {
      updateData({ knownConditions: list.filter((k) => k !== key) });
    } else {
      updateData({ knownConditions: [...list, key] });
    }
  };

  const conditions = [
    { key: "hypertension", label: t.step3.conditions.hypertension },
    { key: "diabetes", label: t.step3.conditions.diabetes },
    { key: "anemia", label: t.step3.conditions.anemia },
    { key: "cardiac_disease", label: t.step3.conditions.cardiac_disease },
    { key: "other", label: t.step3.conditions.other },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#2C2723]">{t.step3.title}</h3>
        <p className="text-xs text-[#7A7165] mt-0.5">{t.step3.subtitle}</p>
      </div>

      {/* Conditions */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#2C2723]">
          {t.step3.conditionsLabel}
        </label>
        <div className="space-y-1.5">
          {conditions.map((c) => {
            const isSelected = data.knownConditions.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => toggleCondition(c.key)}
                className={`w-full p-2.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "border-[#2D6A4F] bg-[#F0F7F3] font-bold text-[#2D6A4F]"
                    : "border-[#E8E1D5] bg-[#F8F5EE] text-[#2C2723]"
                }`}
              >
                <span>{c.label}</span>
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

      {/* Custom condition input when 'other' is checked */}
      {data.knownConditions.includes("other") && (
        <div className="space-y-1 animate-in fade-in duration-200">
          <label className="text-xs font-semibold text-[#2C2723]">
            {t.step3.customConditionLabel}
          </label>
          <input
            type="text"
            value={data.customMedicalCondition}
            onChange={(e) => updateData({ customMedicalCondition: e.target.value })}
            placeholder={t.step3.customConditionPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>
      )}

      {/* Malaria toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5]">
        <span className="text-xs font-semibold text-[#2C2723] pr-2">
          {t.step3.malariaLabel}
        </span>
        <button
          type="button"
          onClick={() => updateData({ malariaEndemicArea: !data.malariaEndemicArea })}
          className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${
            data.malariaEndemicArea ? "bg-[#2D6A4F]" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              data.malariaEndemicArea ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Current Medications */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#2C2723]">
          {t.step3.medsLabel}
        </label>
        <input
          type="text"
          value={data.currentMedications}
          onChange={(e) => updateData({ currentMedications: e.target.value })}
          placeholder={t.step3.medsPlaceholder}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
        />
      </div>
    </div>
  );
}