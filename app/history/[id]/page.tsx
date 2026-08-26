"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { checkinService } from "@/services/checkin.service";
import { CheckInHistoryItem, PendingItem } from "@/types/api";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Pill,
  Baby,
  FileText,
  ShieldAlert,
  Volume2,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CheckinDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { lang } = useLanguage();
  const isAm = lang === "am";

  const checkinId = (params?.id as string) || "";

  const [detail, setDetail] = useState<CheckInHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkinId) return;

    async function loadDetail() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await checkinService.getCheckInDetail(checkinId);
        setDetail(data);
      } catch (err) {
        console.error("Failed to load check-in detail:", err);
        setError(
          isAm
            ? "የምርመራውን ዝርዝር መረጃ መጫን አልተቻለም።"
            : "Could not load check-in details."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDetail();
  }, [checkinId, isAm]);

  if (isLoading) {
    return (
      <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={28} className="animate-spin text-[#2D6A4F]" />
          <p className="text-xs font-semibold text-[#7A7165]">
            {isAm ? "መረጃዎችን በማዘጋጀት ላይ..." : "Loading details..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center">
        <main className="w-full max-w-md flex flex-col items-center justify-center p-6 gap-4">
          <AlertCircle size={36} className="text-red-500" />
          <p className="text-sm font-semibold text-[#1F2937] text-center">
            {error || (isAm ? "ምርመራው አልተገኘም" : "Check-in not found")}
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-2xl bg-[#2D6A4F] text-white text-xs font-bold cursor-pointer"
          >
            {isAm ? "ተመለስ" : "Go Back"}
          </button>
        </main>
      </div>
    );
  }

  const hasDangerSign = detail.danger_sign_triggered;
  const symptoms: PendingItem[] = detail.symptoms || [];
  const foodLog = detail.food_log;
  const supplementCheck = detail.supplement_check;
  const closingMentions = detail.closing_mentions || [];

  const checkinDate = detail.timestamp
    ? new Date(detail.timestamp).toLocaleDateString(isAm ? "am-ET" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : isAm
    ? "ዛሬ"
    : "Today";

  return (
    <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center">
      <main className="w-full max-w-md flex flex-col justify-between p-5 pb-8 font-sans select-none min-h-dvh">
        
        {/* Top Header Bar */}
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-white border border-[#E8E1D5] flex items-center justify-center text-[#1F2937] hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-bold tracking-widest text-[#2D6A4F] uppercase">
                {isAm ? "የምርመራ ዝርዝር" : "Check-in Summary"}
              </span>
              <h1 className="text-sm font-bold text-[#1F2937]">
                {checkinDate}
              </h1>
            </div>

            <Header />
          </div>

          {/* Status Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                <Baby size={17} />
              </span>
              <div>
                <p className="text-[10px] font-semibold text-[#6B7280]">
                  {isAm ? "የምርመራ ሁኔታ" : "Check-in Status"}
                </p>
                <p className="text-xs font-bold text-[#1F2937]">
                  {symptoms.length} {isAm ? "ምልክቶች ተመዝግበዋል" : "symptoms recorded"}
                </p>
              </div>
            </div>

            {hasDangerSign ? (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                <ShieldAlert size={12} />
                <span>{isAm ? "የአደጋ ምልክት" : "High Priority"}</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>{isAm ? "መደበኛ ሁኔታ" : "Normal"}</span>
              </span>
            )}
          </div>
        </header>

        {/* Main Content Sections */}
        <div className="flex-1 space-y-3.5 py-3 overflow-y-auto">
          
          {/* Urgent Danger Alert Banner */}
          {hasDangerSign && (
            <div className="p-4 rounded-3xl bg-red-50 border border-red-200 text-red-900 space-y-1.5 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
                  {isAm ? "አስቸኳይ ክሊኒካል ማስጠንቀቂያ" : "Urgent Clinical Alert"}
                </h3>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {isAm
                  ? "የአደጋ ምልክት ተመዝግቧል — በአስቸኳይ የህክምና እርዳታ ያግኙ"
                  : "Danger sign detected — seek immediate medical attention"}
              </p>
            </div>
          )}

          {/* 1. Voice Intake Summary */}
          {(detail.summary_text_am || detail.summary_text_en) && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Volume2 size={15} className="text-[#2D6A4F]" />
                  <span>{isAm ? "የክሊኒካል ማጠቃለያ" : "Clinical Summary"}</span>
                </span>
              </div>
              <p className="text-xs text-[#4B5563] italic bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8E1D5]/70 leading-relaxed">
                &ldquo;{isAm ? detail.summary_text_am : detail.summary_text_en}&rdquo;
              </p>
            </div>
          )}

          {/* 2. Extracted Symptoms Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <FileText size={15} className="text-[#2D6A4F]" />
                <span>{isAm ? "የተመዘገቡ ምልክቶች" : "Reported Symptoms"}</span>
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280]">
                {symptoms.length} {isAm ? "ምልክት" : "items"}
              </span>
            </div>

            {symptoms.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">
                {isAm ? "ምንም ዓይነት የህመም ምልክት አልተመዘገበም።" : "No adverse symptoms reported."}
              </p>
            ) : (
              <div className="space-y-2">
                {symptoms.map((s, idx) => (
                  <div
                    key={s.item_id || idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      s.danger_sign
                        ? "bg-red-50/70 border-red-200"
                        : "bg-[#FAF7F2] border-[#E8E1D5]"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${s.danger_sign ? "text-red-900" : "text-[#1F2937]"}`}>
                        {s.raw_text}
                      </p>
                      {s.duration && (
                        <p className="text-[10px] text-[#6B7280]">
                          {isAm ? "የቆይታ ጊዜ:" : "Duration:"} {s.duration.value} {s.duration.unit}
                        </p>
                      )}
                    </div>

                    {s.severity && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.severity === "severe"
                            ? "bg-red-200 text-red-800"
                            : "bg-emerald-100 text-[#2D6A4F]"
                        }`}
                      >
                        {s.severity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Nutrition & Food Card */}
          {foodLog && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Utensils size={15} className="text-amber-600" />
                  <span>{isAm ? "የተመገቧቸው ምግቦች" : "Dietary Intake"}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-[#1F2937]">{foodLog.raw_text}</span>
                </div>
                {foodLog.food_groups && foodLog.food_groups.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {foodLog.food_groups.map((fg) => (
                      <span
                        key={fg}
                        className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-[#E8E1D5]"
                      >
                        {fg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Supplement Compliance Card */}
          {supplementCheck && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Pill size={15} className="text-[#2D6A4F]" />
                  <span>{isAm ? "የቅድመ ወሊድ እንክብሎች" : "Prescribed Supplements"}</span>
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  supplementCheck.taken_today ? "bg-[#F0F7F3] border-[#C8E1D3]" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      supplementCheck.taken_today ? "bg-[#2D6A4F] text-white" : "border-2 border-gray-300 bg-white"
                    }`}
                  >
                    {supplementCheck.taken_today && <CheckCircle2 size={13} />}
                  </div>
                  <p className={`text-xs font-bold ${supplementCheck.taken_today ? "text-[#1F2937]" : "text-gray-400 line-through"}`}>
                    {supplementCheck.supplement_name}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">
                  {supplementCheck.taken_today
                    ? isAm ? "ተወስዷል ✓" : "Taken ✓"
                    : isAm ? "ያልተወሰደ" : "Not taken"}
                </span>
              </div>
            </div>
          )}

          {/* 5. Closing Mentions */}
          {closingMentions.length > 0 && (
            <div className="bg-gradient-to-br from-[#2D6A4F]/10 to-[#1E4D38]/5 rounded-3xl p-4 sm:p-5 border border-[#2D6A4F]/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F]">
                <Sparkles size={15} />
                <span>{isAm ? "ተጨማሪ ማስታወሻዎች" : "Additional Notes"}</span>
              </div>
              <div className="space-y-1">
                {closingMentions.map((mention, idx) => (
                  <p key={idx} className="text-xs text-[#2D6A4F] leading-relaxed font-medium">
                    • {mention.raw_text}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer mt-2"
        >
          {isAm ? "ወደ ታሪክ ዝርዝር ተመለስ" : "Back to History"}
        </button>
      </main>
    </div>
  );
}