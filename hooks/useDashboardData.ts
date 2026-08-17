import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  getCheckinHistory,
  verifySupplementIntake,
} from "@/lib/api";
import { SupplementItem } from "@/types/api";
import { DailyAggregatedCheckin } from "@/types/history";
import {
  aggregateDailyCheckins,
  getDateKey,
} from "@/utils/historyAggregator";
import { calculateDaysAway } from "@/utils/homeHelpers";
import { resolvePatientDisplayName } from "@/utils/reportHelpers";
import {
  getStoredCompletedSupplements,
  storeCompletedSupplements,
} from "@/utils/supplementStorage";

export function useDashboardData(language: string) {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [daysAway, setDaysAway] = useState<number | null>(null);
  const [activeSupps, setActiveSupps] = useState<SupplementItem[]>([]);
  const [completedSuppIds, setCompletedSuppIds] = useState<string[]>([]);
  const [isToggling, setIsToggling] = useState(false);
  const [recentDays, setRecentDays] = useState<DailyAggregatedCheckin[]>([]);

  const todayKey = getDateKey(new Date());

  const syncProfileState = (profile: any) => {
    const fallback = language === "am" ? "ያልታወቀ" : "Unknown";
    const resolved = resolvePatientDisplayName(
      profile?.full_name,
      localStorage.getItem("user_name"),
      profile?.email,
      localStorage.getItem("user_email"),
      fallback
    );
    setUserName(resolved);

    const apptDate =
      profile?.appointment?.appointment_date ||
      profile?.next_appointment_date;
    setDaysAway(calculateDaysAway(apptDate));
  };

  const resolveTodayCompleted = (
    supps: SupplementItem[],
    history: DailyAggregatedCheckin[]
  ) => {
    const cachedIds = getStoredCompletedSupplements(todayKey);
    const todayRecord = history.find((d) => d.dateKey === todayKey);

    const matchingIds = new Set<string>(cachedIds);

    if (todayRecord?.supplementTaken && todayRecord.supplementName) {
      const match = supps.find(
        (s) => s.name.toLowerCase() ===
          todayRecord.supplementName.toLowerCase()
      );
      if (match) matchingIds.add(match.id);
    }

    const validIds = Array.from(matchingIds).filter((id) =>
      supps.some((s) => s.id === id)
    );

    setCompletedSuppIds(validIds);
    storeCompletedSupplements(todayKey, validIds);
  };

  const loadData = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      syncProfileState(profile);

      const filteredActive =
        profile?.supplements?.filter((s) => s.active) || [];
      setActiveSupps(filteredActive);

      const rawHistory = await getCheckinHistory();
      const dailyAggregated = aggregateDailyCheckins(rawHistory);
      setRecentDays(dailyAggregated.slice(0, 3));

      resolveTodayCompleted(filteredActive, dailyAggregated);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [language, todayKey]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [router, loadData]);

  const currentSupplement = activeSupps.find(
    (supp) => !completedSuppIds.includes(supp.id)
  );

  const isAllDone =
    activeSupps.length > 0 &&
    completedSuppIds.length >= activeSupps.length;

  const currentSupplementName = currentSupplement
    ? currentSupplement.name
    : isAllDone
    ? language === "am"
      ? "ሁሉም ተወስዷል"
      : "All supplements taken"
    : language === "am"
    ? "ተጨማሪ የለም"
    : "No active supplement";

  const handleMarkNextSupplement = async () => {
    if (isToggling || isAllDone || !currentSupplement) return;

    setIsToggling(true);
    try {
      await verifySupplementIntake({
        supplementId: currentSupplement.id,
        supplementName: currentSupplement.name,
        takenToday: true,
      });

      const updated = [...completedSuppIds, currentSupplement.id];
      setCompletedSuppIds(updated);
      storeCompletedSupplements(todayKey, updated);
    } catch (err) {
      console.error("Failed to mark supplement done:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isLoadingAuth,
    userName,
    daysAway,
    currentSupplementName,
    isAllDone,
    isToggling,
    completedCount: completedSuppIds.length,
    totalCount: activeSupps.length,
    recentDays,
    handleMarkNextSupplement,
  };
}