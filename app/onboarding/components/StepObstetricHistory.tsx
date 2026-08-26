"use client";

import { useLanguage } from "@/context/LanguageContext";
import { getOnboardingText } from "@/lib/translations/onboarding";
import { StepComponentProps } from "../types";

export function StepObstetricHistory({ data, updateData }: StepComponentProps) {
  const { lang } = useLanguage();
  const t = getOnboardingText(lang);

  const toggleComplication = (key: string) => {
    const list = data.pastComplications;
    if (list.includes(key)) {
      updateData({ pastComplications: list.filter((k) => k !== key) });
    } else {
      updateData({ pastComplications: [...list, key] });
    }
  };

  const complications = [
    { key: "preterm_birth", label: t.step2.complications.preterm_birth },
    { key: "pre_eclampsia", label: t.step2.complications.pre_eclampsia },
    { key: "postpartum_hemorrhage", label: t.step2.complications.postpartum_hemorrhage },
    { key: "gestational_diabetes", label: t.step2.complications.gestational_diabetes },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#2C2723]">{t.step2.title}</h3>
        <p className="text-xs text-[#7A7165] mt-0.5">{t.step2.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Total Pregnancies */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#2C2723]">
            {t.step2.gravidaLabel}
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={data.totalPregnancies}
            onChange={(e) =>
              updateData({
                totalPregnancies: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            placeholder="e.g. 2"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>

        {/* Live Births */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#2C2723]">
            {t.step2.paraLabel}
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={data.liveBirths}
            onChange={(e) =>
              updateData({
                liveBirths: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            placeholder="e.g. 1"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>
      </div>

      {/* Binary Questions */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5]">
          <span className="text-xs font-semibold text-[#2C2723]">
            {t.step2.cSectionLabel}
          </span>
          <button
            type="button"
            onClick={() => updateData({ hadCSection: !data.hadCSection })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              data.hadCSection ? "bg-[#2D6A4F]" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                data.hadCSection ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5]">
          <span className="text-xs font-semibold text-[#2C2723]">
            {t.step2.childLossLabel}
          </span>
          <button
            type="button"
            onClick={() => updateData({ childPassedAway: !data.childPassedAway })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              data.childPassedAway ? "bg-[#2D6A4F]" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                data.childPassedAway ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Complications Checklist */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-[#2C2723]">
          {t.step2.complicationsLabel}
        </label>
        <div className="space-y-1.5">
          {complications.map((comp) => {
            const isSelected = data.pastComplications.includes(comp.key);
            return (
              <button
                key={comp.key}
                type="button"
                onClick={() => toggleComplication(comp.key)}
                className={`w-full p-2.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "border-[#2D6A4F] bg-[#F0F7F3] font-bold text-[#2D6A4F]"
                    : "border-[#E8E1D5] bg-[#F8F5EE] text-[#2C2723]"
                }`}
              >
                <span>{comp.label}</span>
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
    </div>
  );
}