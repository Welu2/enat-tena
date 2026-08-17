import { Pill } from "lucide-react";
import { SupplementAdherenceData } from "@/types/report";
import { getSafeAdherencePercentage } from "@/utils/reportHelpers";

interface AdherenceProps {
  title: string;
  selfReportedLabel: string;
  emptyLabel: string;
  adherence?: SupplementAdherenceData | null;
  language: string;
}

function AdherenceProgressBar({
  percentage,
  caption,
}: {
  percentage: number;
  caption: string;
}) {
  return (
    <div className="pt-1">
      <div className="flex items-center justify-between mb-1.5">
        <div className="h-2 flex-1 bg-[#EAE2D5] rounded-full overflow-hidden mr-3">
          <div
            className="h-full bg-brand-green rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-bold text-brand-text">
          {percentage}%
        </span>
      </div>
      <p className="text-[11px] text-brand-subtle italic">{caption}</p>
    </div>
  );
}

export function SupplementAdherenceSection({
  title,
  selfReportedLabel,
  emptyLabel,
  adherence,
  language,
}: AdherenceProps) {
  const percentage = getSafeAdherencePercentage(adherence);
  const total = adherence?.total_reported || 0;
  const taken = adherence?.taken_days || 0;
  const daysText = language === "am" ? "ቀናት ተወስዷል" : "days reported";

  const hasLogs = Boolean(adherence && total > 0);
  const subLabel = hasLogs ? `${taken} / ${total} ${daysText}` : emptyLabel;

  return (
    <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#E2ECE6] text-brand-green flex items-center justify-center flex-shrink-0">
          <Pill size={19} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-brand-text">{title}</h3>
          <p className="text-xs text-brand-subtle mt-0.5">{subLabel}</p>
        </div>
      </div>
      {hasLogs && (
        <AdherenceProgressBar
          percentage={percentage}
          caption={selfReportedLabel}
        />
      )}
    </div>
  );
}