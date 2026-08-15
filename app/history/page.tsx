"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getCheckinHistory } from "@/lib/api";
import { formatSyncedDate } from "@/lib/dateUtils";
import { Loader2, AlertTriangle, ArrowRight, Calendar } from "lucide-react";

interface CheckinHistoryItem {
  id: string;
  timestamp?: string;
  created_at?: string;
  date?: string;
  symptoms: Array<{
    raw_text: string;
    danger_sign: boolean;
    confirmed: boolean;
    severity?: string;
  }>;
  food_log: {
    raw_text: string;
    confirmed: boolean;
  } | null;
  supplement_check: {
    supplement_name: string;
    taken_today: boolean;
    confirmed: boolean;
  } | null;
  danger_sign_triggered: boolean;
}

export default function HistoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [records, setRecords] = useState<CheckinHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Robust date parser ensuring zero timezone shift or NaN issues
  const parseRecordDate = (record: CheckinHistoryItem): Date => {
    const raw = record.timestamp || record.created_at || record.date;
    if (!raw) return new Date();

    if (typeof raw === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split("-").map(Number);
        return new Date(y, m - 1, d, 12, 0, 0);
      }
      const parsed = new Date(raw);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    if (typeof raw === "number") {
      const parsed = new Date(raw);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    return new Date();
  };

  // Auth Guard & API Fetch
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadHistory() {
      try {
        const data = await getCheckinHistory();

        // Sort newest first by true timestamp
        const sorted = [...data].sort(
          (a, b) => parseRecordDate(b).getTime() - parseRecordDate(a).getTime()
        );
        setRecords(sorted);
      } catch (err: unknown) {
        console.error("Failed to load history:", err);
        setFetchError(
          lang === "am"
            ? "የምርመራ ታሪክን መጫን አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
            : "Could not load check-in history. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [router, lang]);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8 select-none font-sans">
      {/* Top Header */}
      <div className="relative pt-16 px-6 sm:px-7">
        <Header />
        <div className="mt-2">
          <h1 className="text-2xl font-extrabold text-brand-text">{t.historyTitle}</h1>
          <p className="text-xs text-brand-subtle font-medium mt-0.5">{t.historySub}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-6 sm:px-7 py-4 space-y-3 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            <p className="text-xs font-semibold text-brand-subtle">
              {lang === "am" ? "መረጃውን በመጫን ላይ..." : "Loading history..."}
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-xs font-semibold text-center">
            {fetchError}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !fetchError && records.length === 0 && (
          <div className="py-16 px-4 text-center space-y-4 bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl mt-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EBE5DA] flex items-center justify-center mx-auto text-brand-subtle">
              <Calendar size={22} className="text-[#8C7A6B]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">
                {lang === "am" ? "ምንም የተመዘገበ ታሪክ የለም" : "No Check-ins Yet"}
              </h3>
              <p className="text-xs text-brand-subtle mt-1 max-w-xs mx-auto">
                {lang === "am"
                  ? "የመጀመሪያዎን የቀን የጤና ምርመራ ድምጽዎን ተጠቅመው አሁኑኑ ይመዝግቡ።"
                  : "Complete your first daily voice check-in to start tracking your health."}
              </p>
            </div>
            <Link
              href="/checkin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-green text-white font-semibold text-xs shadow-xs hover:bg-brand-green-hover active:scale-95 transition-all cursor-pointer"
            >
              <span>{t.startTodayCheckin}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Check-in Cards List */}
        {!isLoading &&
          !fetchError &&
          records.map((record, index) => {
            const dateObj = parseRecordDate(record);
            const formatted = formatSyncedDate(dateObj, lang);

            // Extract primary symptom summary
            const symptomSummary =
              record.symptoms && record.symptoms.length > 0
                ? record.symptoms.map((s) => s.raw_text).join(", ")
                : lang === "am"
                ? "ምንም ምልክት የለም"
                : "No symptoms";

            // Extract food summary
            const foodSummary = record.food_log?.raw_text || null;

            // Check for clinical danger signs
            const hasDangerSign =
              record.danger_sign_triggered ||
              record.symptoms?.some((s) => s.danger_sign);

            // Fallback for backend ID variations
            const checkinId =
              record.id || (record as any).check_in_id || `checkin_${index}`;

            return (
              <div
                key={checkinId}
                onClick={() => router.push(`/history/${checkinId}`)}
                className={`bg-[#FAF7F2] border p-4 rounded-3xl flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:bg-[#F5F0E8] transition-all cursor-pointer ${
                  hasDangerSign
                    ? "border-red-300 bg-red-50/20"
                    : "border-[#E4DCD0] hover:border-[#CCC2B2]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Date Box */}
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

                  {/* Check-in Content */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-brand-text truncate">
                        {symptomSummary}
                      </h3>
                      {hasDangerSign && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 flex-shrink-0">
                          <AlertTriangle size={11} />
                          {lang === "am" ? "አስቸኳይ" : "Alert"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {/* Supplement Badge */}
                      {record.supplement_check?.taken_today && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D7EFE6] text-[#256349] flex-shrink-0">
                          {t.supplementBadge}
                        </span>
                      )}

                      {/* Food Log Text */}
                      {foodSummary && (
                        <span className="text-brand-subtle truncate max-w-[180px] sm:max-w-xs">
                          {foodSummary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chevron */}
                <svg
                  className="w-4 h-4 text-brand-subtle stroke-current flex-shrink-0 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );
          })}
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}