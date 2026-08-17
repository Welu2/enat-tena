import { Utensils } from "lucide-react";
import { FoodLogItem } from "@/types/report";
import { formatLogEntryDate } from "@/utils/reportHelpers";

interface FoodLogProps {
  title: string;
  emptyLabel: string;
  logs: FoodLogItem[];
  language: string;
}

export function FoodLogSection({
  title,
  emptyLabel,
  logs,
  language,
}: FoodLogProps) {
  return (
    <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F0ECE1] text-[#7E6F5E] flex items-center justify-center flex-shrink-0">
          <Utensils size={17} />
        </div>
        <h3 className="text-sm font-bold text-brand-text">{title}</h3>
      </div>
      {logs.length > 0 ? (
        <div className="divide-y divide-[#EDE5DA] text-xs space-y-2 pt-1">
          {logs.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start pt-2 first:pt-0 gap-3"
            >
              <span className="text-brand-subtle font-medium w-20 flex-shrink-0">
                {formatLogEntryDate(item.date, language)}
              </span>
              <span className="text-brand-text text-right font-medium flex-1">
                {item.raw_text}
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