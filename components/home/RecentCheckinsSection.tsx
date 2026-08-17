import Link from "next/link";
import { DailyAggregatedCheckin } from "@/types/history";
import { formatSyncedDate } from "@/lib/dateUtils";
import { toSupportedLanguage } from "@/types/report";
import { ChevronRight } from "lucide-react";

interface RecentCheckinsProps {
  title: string;
  viewAllText: string;
  emptyText: string;
  supplementBadge: string;
  noSupplementText: string;
  recentDays: DailyAggregatedCheckin[];
  language: string;
}

export function RecentCheckinsSection({
  title,
  viewAllText,
  emptyText,
  supplementBadge,
  noSupplementText,
  recentDays,
  language,
}: RecentCheckinsProps) {
  const validLang = toSupportedLanguage(language);

  return (
    <div className="space-y-2.5 pt-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-brand-text">{title}</h4>
        <Link
          href="/history"
          className="text-xs text-brand-subtle hover:text-brand-text font-medium transition-colors"
        >
          {viewAllText}
        </Link>
      </div>

      <div className="space-y-2">
        {recentDays.length > 0 ? (
          recentDays.map((item) => {
            const itemDate = formatSyncedDate(item.dateObj, validLang);
            const titleText = item.symptoms.length > 0
              ? item.symptoms.map((s) => s.raw_text).join(", ")
              : language === "am"
              ? "ምንም ምልክት የለም"
              : "No symptoms";
            const subText = item.supplementTaken
              ? supplementBadge
              : noSupplementText;

            return (
              <Link
                key={item.dateKey}
                href={`/history/${item.id}`}
                className="bg-[#FAF7F2] border border-[#E4DCD0] p-3.5 rounded-2xl flex items-center justify-between hover:border-[#CCC2B2] hover:bg-[#F5F0E8] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EDE7DC] flex flex-col items-center justify-center text-center flex-shrink-0">
                    <span className="text-[9px] uppercase font-bold text-brand-subtle leading-tight">
                      {itemDate.month}
                    </span>
                    <span className="text-sm font-extrabold text-brand-text leading-tight">
                      {itemDate.dayNum}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-brand-text group-hover:text-brand-green transition-colors line-clamp-1">
                      {titleText}
                    </h5>
                    <p className="text-[11px] text-brand-subtle">{subText}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-subtle group-hover:text-brand-text group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            );
          })
        ) : (
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-2xl text-center">
            <p className="text-xs text-brand-subtle">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}