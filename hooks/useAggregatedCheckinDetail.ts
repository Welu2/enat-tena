import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCheckinHistory } from "@/lib/api";
import { AggregatedDayDetail } from "@/types/history";
import {
  aggregateDayRecords,
  parseRecordDate,
  getDateKey,
} from "@/utils/historyAggregator";

export function useAggregatedCheckinDetail(
  checkinId: string,
  language: string
) {
  const router = useRouter();
  const [detail, setDetail] = useState<AggregatedDayDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkinId) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadDayDetail() {
      try {
        setIsLoading(true);
        setError(null);
        const history = await getCheckinHistory();
        const target = history.find((h) => h.id === checkinId);
        const targetDateKey = target
          ? getDateKey(parseRecordDate(target))
          : checkinId;

        const aggregated = aggregateDayRecords(history);
        const matched = aggregated.find(
          (d) => d.id === checkinId || d.dateKey === targetDateKey
        );
        setDetail(matched || null);
      } catch (err) {
        console.error("Failed to load aggregated day detail:", err);
        setError(
          language === "am"
            ? "የምርመራውን ዝርዝር መረጃ መጫን አልተቻለም።"
            : "Could not load check-in details."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDayDetail();
  }, [checkinId, language, router]);

  return { detail, isLoading, error };
}