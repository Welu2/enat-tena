import { Calendar } from "lucide-react";
import { formatSyncedDate } from "@/lib/dateUtils";
import { toSupportedLanguage } from "@/types/report";

interface NextAppointmentBannerProps {
  label: string;
  dateStr: string;
  language: string;
}

export function NextAppointmentBanner({
  label,
  dateStr,
  language,
}: NextAppointmentBannerProps) {
  const validLang = toSupportedLanguage(language);
  const formattedDate = formatSyncedDate(
    new Date(dateStr),
    validLang
  ).full;

  return (
    <div className="bg-[#EFE8DC] border border-[#E0D5C5] p-3.5 rounded-2xl text-center flex items-center justify-center gap-2">
      <Calendar size={14} className="text-brand-green" />
      <p className="text-xs font-bold text-brand-text">
        {label}: {formattedDate}
      </p>
    </div>
  );
}