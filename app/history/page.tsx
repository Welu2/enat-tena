"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { checkinService } from "@/services/checkin.service";
import { CheckInHistoryItem, PendingItem } from "@/types/api";
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Utensils,
  Pill,
  Calendar,
  Clock,
  X,
  ChevronRight,
  ShieldAlert,
  Activity,
} from "lucide-react";

interface DailyAggregatedRecord {
  dateKey: string;
  displayDateAm: string;
  displayDateEn: string;
  dangerSignTriggered: boolean;
  symptoms: PendingItem[];
  foods: string[];
  supplements: { name: string; taken: boolean }[];
  summaryAm: string;
  summaryEn: string;
  rawSessions: CheckInHistoryItem[];
}

export default function HistoryPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isAm = lang === "am";

  const [history, setHistory] = useState<CheckInHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyAggregatedRecord | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await checkinService.getHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const dailyHistory = useMemo<DailyAggregatedRecord[]>(() => {
    if (!history || history.length === 0) return [];

    const dateMap = new Map<string, CheckInHistoryItem[]>();

    history.forEach((item) => {
      const dateKey = item.timestamp
        ? item.timestamp.split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(item);
    });

    const aggregated: DailyAggregatedRecord[] = [];

    dateMap.forEach((dayItems, dateKey) => {
      const dateObj = new Date(dateKey + "T00:00:00");

      const displayDateAm = dateObj.toLocaleDateString("am-ET", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const displayDateEn = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let dangerSignTriggered = false;
      const symptomsMap = new Map<string, PendingItem>();
      const foodSet = new Set<string>();
      const suppMap = new Map<string, boolean>();

      dayItems.forEach((item) => {
        if (item.danger_sign_triggered) dangerSignTriggered = true;

        if (item.symptoms && Array.isArray(item.symptoms)) {
          item.symptoms.forEach((s) => {
            if (s.raw_text?.trim()) {
              if (s.danger_sign) dangerSignTriggered = true;
              symptomsMap.set(s.raw_text.trim(), s);
            }
          });
        }

        if (item.food_log?.raw_text?.trim()) {
          foodSet.add(item.food_log.raw_text.trim());
        }

        if (item.supplement_check?.supplement_name) {
          const suppName = item.supplement_check.supplement_name;
          const current = suppMap.get(suppName) || false;
          suppMap.set(suppName, current || !!item.supplement_check.taken_today);
        }
      });

      aggregated.push({
        dateKey,
        displayDateAm,
        displayDateEn,
        dangerSignTriggered,
        symptoms: Array.from(symptomsMap.values()),
        foods: Array.from(foodSet),
        supplements: Array.from(suppMap.entries()).map(([name, taken]) => ({ name, taken })),
        summaryAm: dayItems[0]?.summary_text_am || "ምንም የአደጋ ምልክት አልተገኘም",
        summaryEn: dayItems[0]?.summary_text_en || "No danger signs detected.",
        rawSessions: dayItems,
      });
    });

    return aggregated.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [history]);

  return (
    <div className="min-h-dvh max-w-lg mx-auto w-full flex flex-col justify-between pb-24 font-sans select-none bg-[#FAF7F2] text-[#2C2723]">
      <div className="p-4 sm:p-5">
        <Header showBack={false} />

       <div className="mt-2 mb-4 pr-24">
  <h1 className="text-base sm:text-lg font-bold text-[#1F2937] flex items-center gap-2 leading-snug">
    <HeartPulse className="text-[#2D6A4F] shrink-0" size={20} />
    <span>{isAm ? "የክሊኒካል ምርመራዎች ታሪክ" : "Daily Clinical Timeline"}</span>
  </h1>
  <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5">
    {isAm ? "ሙሉ ዝርዝር ለማየት ቀኑን ይጫኑ" : "Tap any day to inspect full clinical details"}
  </p>
</div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 size={28} className="animate-spin text-[#2D6A4F]" />
            <p className="text-xs text-[#7A7165]">
              {isAm ? "መረጃዎችን በማምጣት ላይ..." : "Loading timeline..."}
            </p>
          </div>
        ) : dailyHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#E8E1D5] text-center space-y-2 mt-4">
            <HeartPulse size={36} className="mx-auto text-gray-300" />
            <h3 className="text-sm font-bold text-[#1F2937]">
              {isAm ? "ምንም ምርመራ አልተገኘም" : "No Records Found"}
            </h3>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyHistory.map((day) => (
              <div
                key={day.dateKey}
                onClick={() => setSelectedDay(day)}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-[#E8E1D5] shadow-xs space-y-2.5 cursor-pointer hover:border-[#2D6A4F]/40 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center">
                      <Calendar size={15} />
                    </span>
                    <span className="text-xs font-bold text-[#1F2937]">
                      {isAm ? day.displayDateAm : day.displayDateEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {day.dangerSignTriggered ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        {isAm ? "የአደጋ ምልክት" : "Danger Sign"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                        {isAm ? "ደህና" : "Normal"}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">
                  {isAm ? day.summaryAm : day.summaryEn}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {day.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                        s.danger_sign ? "bg-red-50 text-red-700" : "bg-neutral-100 text-[#2C2723]"
                      }`}
                    >
                      {s.raw_text}
                    </span>
                  ))}
                  {day.supplements.some((sp) => sp.taken) && (
                    <span className="text-[10px] font-semibold bg-emerald-50 text-[#2D6A4F] px-2 py-0.5 rounded-lg">
                      IFA ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Full Clinical Detail Sheet */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-gray-100">
            
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#2D6A4F]" />
                <h3 className="text-sm sm:text-base font-bold text-[#1F2937]">
                  {isAm ? selectedDay.displayDateAm : selectedDay.displayDateEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Danger Sign Alert in Modal */}
            {selectedDay.dangerSignTriggered ? (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-600 flex-shrink-0" />
                <p className="text-xs font-semibold">
                  {isAm
                    ? "በዚህ ቀን የአደጋ ምልክት ተመዝግቧል"
                    : "Clinical danger signs were flagged on this date"}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 size={16} />
                <span>{isAm ? "መደበኛ ክሊኒካል ሁኔታ" : "Normal clinical status"}</span>
              </div>
            )}

            {/* Complete Symptoms Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Activity size={14} className="text-[#2D6A4F]" />
                <span>{isAm ? "የተመዘገቡ ምልክቶች ዝርዝር" : "Reported Symptoms"}</span>
              </span>

              {selectedDay.symptoms.length === 0 ? (
                <p className="text-xs text-gray-400 py-1">
                  {isAm ? "ምንም ምልክት አልተመዘገበም" : "No symptoms logged"}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selectedDay.symptoms.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#1F2937]">{s.raw_text}</p>
                        {s.duration?.value && (
                          <p className="text-[10px] text-[#6B7280] mt-0.5">
                            {isAm ? "የቆይታ ጊዜ:" : "Duration:"} {s.duration.value} {s.duration.unit}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          s.danger_sign ? "bg-red-100 text-red-700" : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {s.severity || "Mild"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diet & Food Entries */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Utensils size={14} className="text-amber-600" />
                <span>{isAm ? "የተመገቧቸው ምግቦች" : "Diet & Food Logged"}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDay.foods.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    {isAm ? "ምንም ምግብ አልተመዘገበም" : "No meals logged"}
                  </p>
                ) : (
                  selectedDay.foods.map((food, i) => (
                    <span
                      key={i}
                      className="text-xs bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-1 rounded-xl font-medium"
                    >
                      {food}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Supplement Adherence */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Pill size={14} className="text-[#2D6A4F]" />
                <span>{isAm ? "ማሟያ እንክብሎች" : "Supplements (IFA)"}</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {selectedDay.supplements.map((supp, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                      supp.taken
                        ? "bg-[#F0F7F3] border-[#C8E1D3] text-[#2D6A4F]"
                        : "bg-gray-50 border-gray-200 text-gray-400 line-through"
                    }`}
                  >
                    <span>{supp.name}</span>
                    <span>{supp.taken ? "✓" : "✗"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exact Timestamped Sessions */}
            {/* <div className="space-y-1.5 pt-2 border-t text-[11px] text-[#7A7165]">
              <span className="font-bold text-[#1F2937] block">
                {isAm ? "የተመዘገቡበት ሰዓታት:" : "Logged Sessions:"}
              </span>
              {selectedDay.rawSessions.map((session, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Clock size={11} />
                  <span>
                    {new Date(session.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div> */}
              {/* ))}
            </div> */}

            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="w-full py-3 rounded-2xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1E4D38] transition-colors cursor-pointer"
            >
              {isAm ? "ዝጋ" : "Close"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}