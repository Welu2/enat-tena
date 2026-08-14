"use client";

import { useLanguage } from "@/context/LanguageContext";

interface StepAppointmentProps {
  hasAppointment: boolean;
  setHasAppointment: (val: boolean) => void;
  appointmentDate: string;
  setAppointmentDate: (val: string) => void;
   onNoAnswer?: () => void;
}

export function StepAppointment({
  hasAppointment,
  setHasAppointment,
  appointmentDate,
  setAppointmentDate,
  onNoAnswer,
}: StepAppointmentProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-brand-subtle uppercase">
          {t.step2Of3}
        </p>
        <h2 className="text-2xl font-bold text-brand-text mt-1">{t.appointmentTitle}</h2>
        <p className="text-xs sm:text-sm text-brand-subtle mt-1.5">
          {t.appointmentQuestion}
        </p>
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setHasAppointment(true)}
          className={`py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
            hasAppointment
              ? "bg-brand-green text-white"
              : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:bg-[#F2ECE3]"
          }`}
        >
          {t.yes}
        </button>
        <button
          type="button"
          onClick={() => {setHasAppointment(false);
            if (onNoAnswer) onNoAnswer();}}
          className={`py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
            !hasAppointment
              ? "bg-brand-green text-white"
              : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:bg-[#F2ECE3]"
          }`}
        >
          {t.notNow}
        </button>
      </div>

      {/* Date Picker Input */}
      {hasAppointment && (
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-brand-text">
            {t.appointmentDateLabel}
          </label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
          <p className="text-[11px] text-brand-subtle font-normal pt-1">
            {t.appointmentHint}
          </p>
        </div>
      )}
    </div>
  );
}