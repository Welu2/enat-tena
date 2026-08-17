import { Activity } from "lucide-react";
import { SymptomLogItem } from "@/types/report";
import { formatLogEntryDate } from "@/utils/reportHelpers";

interface SymptomsLogProps {
  title: string;
  emptyLabel: string;
  symptoms: SymptomLogItem[];
  language: string;
}

export function SymptomsLogSection({
  title,
  emptyLabel,
  symptoms,
  language,
}: SymptomsLogProps) {
  return (
    <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#E8EFEA] text-brand-green flex items-center justify-center flex-shrink-0">
          <Activity size={17} />
        </div>
        <h3 className="text-sm font-bold text-brand-text">{title}</h3>
      </div>
      {symptoms.length > 0 ? (
        <div className="divide-y divide-[#EDE5DA] text-xs pt-1 space-y-2">
          {symptoms.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center pt-2 first:pt-0"
            >
              <span className="text-brand-subtle font-medium">
                {formatLogEntryDate(item.date, language)}
              </span>
              <span className="text-brand-text font-bold">
                {item.raw_text || item.symptom}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-brand-subtle italic pt-1">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}