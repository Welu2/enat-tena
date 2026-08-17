"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getCheckinHistory } from "@/lib/api";
import { DailyAggregatedCheckin } from "@/types/history";
import { aggregateDailyCheckins } from "@/utils/historyAggregator";
import { CheckinCard } from "@/components/history/CheckinCard";
import { HistoryEmptyState } from "@/components/history/HistoryEmptyState";
import { Loader2 } from "lucide-react";

function formatHistorySubtitle(
  count: number,
  language: string
): string {
  if (language === "am") {
    return `${count} ቀናት ተመዝግበዋል`;
  }
  return `${count} ${count === 1 ? "day" : "days"} recorded`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [records, setRecords] = useState<DailyAggregatedCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadHistory() {
      try {
        const rawHistory = await getCheckinHistory();
        const consolidated = aggregateDailyCheckins(rawHistory);
        setRecords(consolidated);
      } catch (err) {
        console.error("Failed to load history:", err);
        setFetchError(
          lang === "am"
            ? "የምርመራ ታሪክን መጫን አልተቻለም።"
            : "Could not load check-in history."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [router, lang]);

  const subtitle = formatHistorySubtitle(records.length, lang);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8 select-none font-sans">
      <div className="relative pt-16 px-6 sm:px-7">
        <Header />
        <div className="mt-2">
          <h1 className="text-2xl font-extrabold text-brand-text">
            {t.historyTitle}
          </h1>
          <p className="text-xs text-brand-subtle font-medium mt-0.5">
            {!isLoading && subtitle}
          </p>
        </div>
      </div>

      <main className="flex-1 px-6 sm:px-7 py-4 space-y-3 overflow-y-auto">
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            <p className="text-xs font-semibold text-brand-subtle">
              {lang === "am"
                ? "መረጃውን በመጫን ላይ..."
                : "Loading history..."}
            </p>
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-xs font-semibold text-center">
            {fetchError}
          </div>
        )}

        {!isLoading && !fetchError && records.length === 0 && (
          <HistoryEmptyState
            language={lang}
            buttonText={t.startTodayCheckin}
          />
        )}

        {!isLoading &&
          !fetchError &&
          records.map((item) => (
            <CheckinCard
              key={item.dateKey}
              record={item}
              language={lang}
              badgeText={t.supplementBadge}
              onSelect={(id) => router.push(`/history/${id}`)}
            />
          ))}
      </main>

      <BottomNav />
    </div>
  );
}