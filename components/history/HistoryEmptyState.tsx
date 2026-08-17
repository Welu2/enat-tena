import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

interface HistoryEmptyStateProps {
  language: string;
  buttonText: string;
}

export function HistoryEmptyState({
  language,
  buttonText,
}: HistoryEmptyStateProps) {
  const isAmharic = language === "am";
  const heading = isAmharic
    ? "ምንም የተመዘገበ ታሪክ የለም"
    : "No Check-ins Yet";
  const message = isAmharic
    ? "የመጀመሪያዎን የቀን የጤና ምርመራ ድምጽዎን ተጠቅመው አሁኑኑ ይመዝግቡ።"
    : "Complete your daily check-in to start tracking.";

  return (
    <div className="py-16 px-4 text-center space-y-4 bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl mt-4 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-[#EBE5DA] flex items-center justify-center mx-auto text-brand-subtle">
        <Calendar size={22} className="text-[#8C7A6B]" />
      </div>
      <div>
        <h3 className="text-base font-bold text-brand-text">{heading}</h3>
        <p className="text-xs text-brand-subtle mt-1 max-w-xs mx-auto">
          {message}
        </p>
      </div>
      <Link
        href="/checkin"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-green text-white font-semibold text-xs shadow-xs hover:bg-brand-green-hover active:scale-95 transition-all cursor-pointer"
      >
        <span>{buttonText}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}