"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getOnboardingText } from "@/lib/translations/onboarding";
import { StepComponentProps } from "../types";
import { userService } from "@/services/user.service";
import { Calendar, CheckCircle2, Clock, Hospital, Loader2, MapPin } from "lucide-react";

export function StepDatingDemographics({ data, updateData }: StepComponentProps) {
  const { lang } = useLanguage();
  const isAm = lang === "am";
  const t = getOnboardingText(lang);

  const [isCalculating, setIsCalculating] = useState(false);

  // Live Gestational Age Preview API caller
  useEffect(() => {
    let isCancelled = false;

    async function computeGestationalAge() {
      if (data.datingMethod === "lnmp" && !data.lnmpDate) return;
      if (data.datingMethod === "manual" && !data.manualWeeks) return;

      setIsCalculating(true);
      try {
        const payload: {
          pregnancy_counting_method: string;
          lnmp_date?: string;
          manual_gestational_weeks?: number;
          manual_gestational_days?: number;
        } = {
          pregnancy_counting_method: data.datingMethod,
        };

        if (data.datingMethod === "lnmp") {
          payload.lnmp_date = data.lnmpDate;
        } else if (data.datingMethod === "manual") {
          payload.manual_gestational_weeks = Number(data.manualWeeks) || 0;
          payload.manual_gestational_days = Number(data.manualDays) || 0;
        }

        const calculation = await userService.calculateGestationalAge(payload);
        if (!isCancelled) {
          updateData({ calculatedStatus: calculation });
        }
      } catch (err) {
        console.error("Live calculation failed:", err);
      } finally {
        if (!isCancelled) setIsCalculating(false);
      }
    }

    const timer = setTimeout(computeGestationalAge, 400);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [data.datingMethod, data.lnmpDate, data.manualWeeks, data.manualDays]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#2C2723]">{t.step1.title}</h3>
        <p className="text-xs text-[#7A7165] mt-0.5">{t.step1.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Age */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#2C2723]">
            {t.step1.ageLabel}
          </label>
          <input
            type="number"
            min={12}
            max={60}
            value={data.age}
            onChange={(e) =>
              updateData({ age: e.target.value === "" ? "" : Number(e.target.value) })
            }
            placeholder={t.step1.agePlaceholder}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>

        {/* Residence Area */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#2C2723]">
            {t.step1.areaLabel}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => updateData({ area: "urban" })}
              className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                data.area === "urban"
                  ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                  : "bg-[#F8F5EE] text-[#7A7165] border-[#E8E1D5]"
              }`}
            >
              {t.step1.urban}
            </button>
            <button
              type="button"
              onClick={() => updateData({ area: "rural" })}
              className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                data.area === "rural"
                  ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                  : "bg-[#F8F5EE] text-[#7A7165] border-[#E8E1D5]"
              }`}
            >
              {t.step1.rural}
            </button>
          </div>
        </div>
      </div>

      {/* Preferred Hospital */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#2C2723] flex items-center gap-1.5">
          <Hospital size={14} className="text-[#2D6A4F]" />
          <span>{t.step1.hospitalLabel}</span>
        </label>
        <input
          type="text"
          value={data.hospital}
          onChange={(e) => updateData({ hospital: e.target.value })}
          placeholder={t.step1.hospitalPlaceholder}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
        />
      </div>

      {/* Dating Method Selector */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-[#2C2723]">
          {t.step1.datingMethodLabel}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateData({ datingMethod: "lnmp" })}
            className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
              data.datingMethod === "lnmp"
                ? "border-[#2D6A4F] bg-[#F0F7F3] font-bold text-[#2D6A4F]"
                : "border-[#E8E1D5] bg-[#F8F5EE] text-[#7A7165]"
            }`}
          >
            {t.step1.lnmpMethod}
          </button>
          <button
            type="button"
            onClick={() => updateData({ datingMethod: "manual" })}
            className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
              data.datingMethod === "manual"
                ? "border-[#2D6A4F] bg-[#F0F7F3] font-bold text-[#2D6A4F]"
                : "border-[#E8E1D5] bg-[#F8F5EE] text-[#7A7165]"
            }`}
          >
            {t.step1.manualMethod}
          </button>
        </div>
      </div>

      {/* Inputs based on Dating Method */}
      {data.datingMethod === "lnmp" ? (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#2C2723] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#2D6A4F]" />
            <span>{t.step1.lnmpDateLabel}</span>
          </label>
          <input
            type="date"
            value={data.lnmpDate}
            onChange={(e) => updateData({ lnmpDate: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2723]">
              {t.step1.manualWeeksLabel}
            </label>
            <input
              type="number"
              min={1}
              max={44}
              value={data.manualWeeks}
              onChange={(e) =>
                updateData({
                  manualWeeks: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="e.g. 16"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2723]">
              {t.step1.manualDaysLabel}
            </label>
            <input
              type="number"
              min={0}
              max={6}
              value={data.manualDays}
              onChange={(e) =>
                updateData({
                  manualDays: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="0-6"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D5] text-[#2C2723] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
        </div>
      )}

      {/* Backend Live Calculated Preview Card */}
      {data.calculatedStatus && (
        <div className="p-3.5 rounded-2xl bg-[#F0F7F3] border border-[#C8E1D3] space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              {t.step1.livePreviewTitle}
            </span>
            {isCalculating && <Loader2 size={13} className="animate-spin text-[#2D6A4F]" />}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <span className="text-[#7A7165] block">{t.step1.gaLabel}</span>
              <span className="font-bold text-[#2C2723]">
                {isAm
                  ? data.calculatedStatus.formatted_age_am
                  : data.calculatedStatus.formatted_age_en}
              </span>
            </div>
            <div>
              <span className="text-[#7A7165] block">{t.step1.eddLabel}</span>
              <span className="font-bold text-[#2C2723]">
                {data.calculatedStatus.estimated_due_date}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#2D6A4F] font-medium pt-0.5">
            {isAm
              ? data.calculatedStatus.trimester_info.name_am
              : data.calculatedStatus.trimester_info.name_en}
          </div>
        </div>
      )}
    </div>
  );
}