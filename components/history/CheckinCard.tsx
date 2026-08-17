import { formatSyncedDate } from "@/lib/dateUtils";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { DailyAggregatedCheckin } from "@/types/history";

interface CheckinCardProps {
  record: DailyAggregatedCheckin;
  language: string;
  badgeText: string;
  onSelect: (id: string) => void;
}

function DateBadge({
  dateObj,
  language,
}: {
  dateObj: Date;
  language: string;
}) {
  const langKey = language === "am" ? "am" : "en";
  const formatted = formatSyncedDate(dateObj, langKey);

  return (
    <div className="w-12 h-14 rounded-2xl bg-[#EBE5DA] flex flex-col items-center justify-center text-center flex-shrink-0 shadow-inner">
      <span className="text-[9px] uppercase font-bold text-brand-subtle tracking-wider leading-none">
        {formatted.dayName?.slice(0, 3) || "---"}
      </span>
      <span className="text-base font-black text-brand-text leading-tight my-0.5">
        {formatted.dayNum}
      </span>
      <span className="text-[8px] uppercase font-semibold text-brand-subtle leading-none">
        {formatted.month}
      </span>
    </div>
  );
}

export function CheckinCard({
  record,
  language,
  badgeText,
  onSelect,
}: CheckinCardProps) {
  const emptyText = language === "am" ? "ምንም ምልክት የለም" : "No symptoms";
  const symptomText =
    record.symptoms.length > 0
      ? record.symptoms.map((s) => s.raw_text).join(", ")
      : emptyText;

  const cardStyle = record.hasDangerSign
    ? "border-red-300 bg-red-50/20"
    : "border-[#E4DCD0] hover:border-[#CCC2B2]";

  return (
    <div
      onClick={() => onSelect(record.id)}
      className={`bg-[#FAF7F2] border p-4 rounded-3xl flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:bg-[#F5F0E8] transition-all cursor-pointer ${cardStyle}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <DateBadge dateObj={record.dateObj} language={language} />

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-brand-text truncate">
              {symptomText}
            </h3>
            {record.hasDangerSign && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 flex-shrink-0">
                <AlertTriangle size={11} />
                {language === "am" ? "አስቸኳይ" : "Alert"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {record.supplementTaken && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D7EFE6] text-[#256349] flex-shrink-0">
                {badgeText}
              </span>
            )}
            {record.foodSummary && (
              <span className="text-brand-subtle truncate max-w-[180px] sm:max-w-xs">
                {record.foodSummary}
              </span>
            )}
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-brand-subtle flex-shrink-0 ml-2" />
    </div>
  );
}