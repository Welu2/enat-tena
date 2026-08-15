"use client";

import { useState, useEffect, use } from "react";
import { formatSyncedDate } from "@/lib/dateUtils";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Utensils,
  Activity,
  AlertCircle,
  Scale,
  ShieldCheck,
  Calendar,
  Clock,
  Printer,
  HeartPulse,
} from "lucide-react";

interface PublicSummaryContent {
  danger_signs?: Array<
    | {
        raw_text?: string;
        category?: string;
        severity?: string;
        date?: string;
      }
    | string
  >;
  general_symptoms?: Array<{
    date?: string;
    symptom?: string;
    raw_text?: string;
    severity?: string;
  }>;
  symptoms_summary?: Array<{
    date?: string;
    symptom?: string;
    raw_text?: string;
    severity?: string;
  }>;
  food_logs?: Array<{
    date?: string;
    raw_text: string;
  }>;
  supplement_adherence?: {
    taken_days: number;
    total_reported: number;
    percentage: number;
  } | null;
  muac_reminder?: string | null;
  provenance_note?: string | null;
  closing_mentions?: string[];
  patient_questions?: Array<{
    question?: string;
    raw_text?: string;
  }>;
}

interface PublicSummaryData {
  id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  content_json: PublicSummaryContent | string;
  share_link_slug?: string;
  qr_code_url?: string;
}

export default function PublicClinicianSummaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [summary, setSummary] = useState<PublicSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicSummary() {
      setIsLoading(true);
      setFetchError(null);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://enat-backend-2jlo.onrender.com";

      try {
        const res = await fetch(`${baseUrl}/summary/public/${slug}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Clinician summary report not found or has expired.");
        }

        const data: PublicSummaryData = await res.json();

        // Safely parse stringified content_json if returned by backend
        if (typeof data.content_json === "string") {
          try {
            data.content_json = JSON.parse(data.content_json);
          } catch (e) {
            console.error("Failed to parse content_json:", e);
          }
        }

        setSummary(data);
      } catch (err: unknown) {
        const error = err as Error;
        setFetchError(error.message || "Failed to load clinical report.");
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchPublicSummary();
    }
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  const content: PublicSummaryContent | undefined =
    summary && typeof summary.content_json !== "string"
      ? (summary.content_json as PublicSummaryContent)
      : undefined;

  const symptoms = content?.general_symptoms || content?.symptoms_summary || [];
  const dangerSigns = content?.danger_signs || [];
  const foodLogs = content?.food_logs || [];
  const adherence = content?.supplement_adherence;
  const adherencePercent = adherence ? Math.round(adherence.percentage) : 0;
  const muacReminder = content?.muac_reminder;
  const provenanceNote = content?.provenance_note;
  const closingQuestions = content?.patient_questions || [];

  const formatPeriodRange = () => {
    if (!summary?.period_start || !summary?.period_end) return "Recent Review Period";
    try {
      const startFormatted = formatSyncedDate(new Date(summary.period_start), "en");
      const endFormatted = formatSyncedDate(new Date(summary.period_end), "en");
      return `${startFormatted.month} ${startFormatted.dayNum} – ${endFormatted.month} ${endFormatted.dayNum}, ${endFormatted.year}`;
    } catch {
      return `${summary.period_start} – ${summary.period_end}`;
    }
  };

  const formatItemDate = (rawDate?: string) => {
    if (!rawDate) return "Recent";
    try {
      const parsed = new Date(rawDate);
      if (isNaN(parsed.getTime())) return rawDate;
      const formatted = formatSyncedDate(parsed, "en");
      return `${formatted.month} ${formatted.dayNum}`;
    } catch {
      return rawDate;
    }
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE] text-brand-text font-sans antialiased pb-16 print:bg-white print:pb-0">
      {/* Top Clinical Header Bar */}
      <header className="bg-[#214334] text-white border-b border-[#183327] sticky top-0 z-40 print:static print:bg-white print:text-black print:border-b-2">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs print:hidden">
              <HeartPulse size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-widest uppercase bg-[#34634E] text-[#B8F0D4] px-2 py-0.5 rounded-md print:border print:text-black">
                  Clinical Portal
                </span>
                <span className="text-xs text-white/60 font-mono hidden sm:inline print:inline">
                  ID: {slug}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white mt-0.5 tracking-tight print:text-black">
                Antenatal Care Health Summary
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer print:hidden"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-6 space-y-4 print:p-0 print:space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 text-[#214334] animate-spin" />
            <p className="text-sm font-medium text-brand-subtle">
              Retrieving verified patient summary...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-800 space-y-2 text-center my-10">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold">Report Not Found</h3>
            <p className="text-xs text-red-700 max-w-sm mx-auto">{fetchError}</p>
          </div>
        )}

        {/* Loaded Clinical Report View */}
        {!isLoading && summary && content && (
          <>
            {/* Meta Information Card */}
            <div className="bg-white border border-[#E4DCD0] rounded-3xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8EFEA] text-[#214334] flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                    Observation Interval
                  </p>
                  <p className="text-sm font-bold text-brand-text mt-0.5">
                    {formatPeriodRange()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8EFEA] text-[#214334] flex items-center justify-center flex-shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                    Report Timestamp
                  </p>
                  <p className="text-sm font-bold text-brand-text mt-0.5">
                    {summary.generated_at
                      ? formatSyncedDate(new Date(summary.generated_at), "en").full
                      : "Recently generated"}
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Protocol Danger Signs Banner */}
            <div
              className={`p-5 rounded-3xl flex items-start gap-4 border transition-all ${
                dangerSigns.length > 0
                  ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"
                  : "bg-white border-[#E4DCD0]"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  dangerSigns.length > 0
                    ? "bg-[#FEE2E2] text-[#DC2626]"
                    : "bg-[#E2ECE6] text-[#214334]"
                }`}
              >
                {dangerSigns.length > 0 ? (
                  <AlertTriangle size={24} />
                ) : (
                  <CheckCircle2 size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold tracking-tight">
                    Obstetric Danger Signs Evaluation
                  </h2>
                  {dangerSigns.length > 0 ? (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#DC2626] text-white px-2 py-0.5 rounded-full">
                      Immediate Attention
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#E2ECE6] text-[#214334] px-2 py-0.5 rounded-full">
                      Normal / Clear
                    </span>
                  )}
                </div>

                {dangerSigns.length > 0 ? (
                  <div className="mt-2.5 space-y-1.5 bg-white/70 p-3 rounded-2xl border border-red-200">
                    {dangerSigns.map((ds, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-bold text-red-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                        <span>{typeof ds === "string" ? ds : ds.raw_text || ds.category}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-subtle mt-1 font-medium">
                    No critical danger signs or severe red-flag conditions reported by the patient during this monitoring interval.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Clinical Alert: MUAC Screening */}
            {muacReminder && (
              <div className="p-4.5 rounded-3xl bg-[#FFF8EE] border border-[#F2DEBA] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FEEBC8] text-[#C05621] flex items-center justify-center flex-shrink-0">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#7B341E]">
                    Anthropometric Screening Reminder
                  </h3>
                  <p className="text-xs text-[#9C4221] mt-0.5 font-medium leading-relaxed">
                    {muacReminder}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Supplement Adherence Card */}
            <div className="bg-white border border-[#E4DCD0] p-5 rounded-3xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E2ECE6] text-[#214334] flex items-center justify-center flex-shrink-0">
                    <Pill size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">
                      Micronutrient Supplement Adherence
                    </h3>
                    <p className="text-xs text-brand-subtle mt-0.5">
                      {adherence
                        ? `${adherence.taken_days} confirmed doses out of ${adherence.total_reported} check-in days`
                        : "No supplement records reported for this period"}
                    </p>
                  </div>
                </div>

                {adherence && (
                  <div className="text-right">
                    <span className="text-lg font-black text-[#214334]">
                      {adherencePercent}%
                    </span>
                  </div>
                )}
              </div>

              {adherence && (
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full bg-[#EAE2D5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#214334] rounded-full transition-all duration-500"
                      style={{ width: `${adherencePercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-brand-subtle italic">
                    Self-reported daily iron & folic acid compliance log.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Symptoms & Subjective Complaints Log */}
            <div className="bg-white border border-[#E4DCD0] p-5 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center gap-3 pb-1 border-b border-[#EDE5DA]">
                <div className="w-9 h-9 rounded-xl bg-[#E8EFEA] text-[#214334] flex items-center justify-center flex-shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text">Reported Symptoms</h3>
                  <p className="text-[11px] text-brand-subtle">
                    Intake transcripts and mild/moderate complaints
                  </p>
                </div>
              </div>

              {symptoms.length > 0 ? (
                <div className="divide-y divide-[#EDE5DA] text-xs">
                  {symptoms.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2.5 first:pt-1 last:pb-1"
                    >
                      <span className="text-brand-subtle font-medium w-24 flex-shrink-0">
                        {formatItemDate(item.date)}
                      </span>
                      <span className="text-brand-text font-bold flex-1 text-right">
                        {item.raw_text || item.symptom}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-subtle italic py-2">
                  No symptoms or physical complaints reported during this interval.
                </p>
              )}
            </div>

            {/* 5. Dietary Intake Log */}
            <div className="bg-white border border-[#E4DCD0] p-5 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center gap-3 pb-1 border-b border-[#EDE5DA]">
                <div className="w-9 h-9 rounded-xl bg-[#F0ECE1] text-[#7E6F5E] flex items-center justify-center flex-shrink-0">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text">Dietary & Nutrition Logs</h3>
                  <p className="text-[11px] text-brand-subtle">
                    Patient self-reported daily meals
                  </p>
                </div>
              </div>

              {foodLogs.length > 0 ? (
                <div className="divide-y divide-[#EDE5DA] text-xs">
                  {foodLogs.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start py-2.5 first:pt-1 last:pb-1 gap-4"
                    >
                      <span className="text-brand-subtle font-medium w-24 flex-shrink-0">
                        {formatItemDate(item.date)}
                      </span>
                      <span className="text-brand-text font-medium text-right flex-1">
                        {item.raw_text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-subtle italic py-2">
                  No dietary intake logs recorded for this period.
                </p>
              )}
            </div>

            {/* 6. Patient Questions / Closing Inquiries (If any) */}
            {closingQuestions.length > 0 && (
              <div className="bg-white border border-[#E4DCD0] p-5 rounded-3xl space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-brand-text">
                  Patient Inquiries for Doctor Visit
                </h3>
                <div className="divide-y divide-[#EDE5DA] text-xs">
                  {closingQuestions.map((q, idx) => (
                    <div key={idx} className="py-2 text-brand-text font-medium">
                      • {q.question || q.raw_text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Clinical Data Provenance & Legal Disclaimer */}
            <div className="bg-[#E4ECE7] border border-[#D0DFD6] p-4.5 rounded-3xl space-y-1.5 text-xs text-[#294B3B] leading-relaxed">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[#214334]">
                <ShieldCheck size={16} />
                <span>Clinical Data Provenance Notice</span>
              </div>
              <p className="text-[11px]">
                {provenanceNote ||
                  "All data in this summary is self-reported by the patient through the EnatAI voice check-in system and verified by user read-back confirmation. It is designed for clinical reference during Antenatal Care (ANC) consultations."}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}