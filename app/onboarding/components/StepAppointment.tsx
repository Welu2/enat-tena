"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface StepAppointmentProps {
  hasAppointment: boolean;
  setHasAppointment: (val: boolean) => void;
  appointmentDate: string;
  setAppointmentDate: (val: string) => void;
  onNoAnswer?: () => void;
  onErrorChange?: (hasError: boolean) => void;
}

// Helper: Formats a date object to local "YYYY-MM-DD" (avoids UTC timezone shifts)
function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StepAppointment({
  hasAppointment,
  setHasAppointment,
  appointmentDate,
  setAppointmentDate,
  onNoAnswer,
  onErrorChange,
}: StepAppointmentProps) {
  const { t, lang } = useLanguage();
  const [dateError, setDateError] = useState<string | null>(null);

  // Timezone-safe boundaries based on today's local date
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const maxDateStr = useMemo(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return getLocalDateString(nextYear);
  }, []);

  // Validation function: compares YYYY-MM-DD strings directly
  const validateDate = (selectedVal: string) => {
    if (!selectedVal) {
      const err =
        lang === "am"
          ? "እባክዎ የቀጠሮ ቀን ይምረጡ"
          : "Please select an appointment date";
      setDateError(err);
      onErrorChange?.(true);
      return false;
    }

    // Direct lexicographical comparison (YYYY-MM-DD is always sortable)
    if (selectedVal < todayStr) {
      const err =
        lang === "am"
          ? "የቀጠሮ ቀን ያለፈ ቀን መሆን አይችልም"
          : "Appointment date cannot be in the past";
      setDateError(err);
      onErrorChange?.(true);
      return false;
    }

    if (selectedVal > maxDateStr) {
      const err =
        lang === "am"
          ? "የቀጠሮ ቀን ከአንድ አመት በላይ መሆን አይችልም"
          : "Appointment date must be within 1 year";
      setDateError(err);
      onErrorChange?.(true);
      return false;
    }

    // Valid date
    setDateError(null);
    onErrorChange?.(false);
    return true;
  };

  const handleDateChange = (val: string) => {
    setAppointmentDate(val);
    validateDate(val);
  };

  // Sync validation state whenever appointment toggle changes
  useEffect(() => {
    if (!hasAppointment) {
      setDateError(null);
      onErrorChange?.(false);
    } else if (hasAppointment && appointmentDate) {
      validateDate(appointmentDate);
    }
  }, [hasAppointment, appointmentDate]);

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
          className={`py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-95 ${
            hasAppointment
              ? "bg-brand-green text-white"
              : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:bg-[#F2ECE3]"
          }`}
        >
          {t.yes}
        </button>
        <button
          type="button"
          onClick={() => {
            setHasAppointment(false);
            if (onNoAnswer) onNoAnswer();
          }}
          className={`py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-95 ${
            !hasAppointment
              ? "bg-brand-green text-white"
              : "bg-[#FAF7F2] border border-[#E4DCD0] text-brand-text hover:bg-[#F2ECE3]"
          }`}
        >
          {t.notNow}
        </button>
      </div>

      {/* Date Picker Input with Real-time Validation */}
      {hasAppointment && (
        <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-brand-text">
            {t.appointmentDateLabel}
          </label>
          <input
            type="date"
            min={todayStr}
            max={maxDateStr}
            value={appointmentDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className={`w-full px-4 py-3.5 rounded-2xl bg-brand-input border text-brand-text font-medium text-sm focus:outline-none transition-all ${
              dateError
                ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                : "border-[#E4DCD0] focus:ring-2 focus:ring-brand-green"
            }`}
          />

          {/* Validation Feedback */}
          {dateError ? (
            <p className="text-[11px] font-medium text-red-600 pl-1 flex items-center gap-1">
              <span>•</span> {dateError}
            </p>
          ) : (
            <p className="text-[11px] text-brand-subtle font-normal pt-0.5">
              {t.appointmentHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}