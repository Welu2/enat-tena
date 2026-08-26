"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { summaryService } from "@/services/summary.service";
import { ClinicianSummaryResponse } from "@/types/api";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Utensils,
  Calendar,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Clock,
  Printer,
} from "lucide-react";

export default function PublicDoctorSummaryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [summary, setSummary] = useState<ClinicianSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicSummary() {
      if (!slug) return;
      try {
        const data = await summaryService.getPublicSummary(slug);
        setSummary(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load clinical summary";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicSummary();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-6 text-neutral-800 font-sans">
        <Loader2 size={32} className="animate-spin text-[#2D6A4F] mb-3" />
        <p className="text-xs font-semibold text-neutral-500">
          Decrypting clinical intake telemetry...
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-6 text-neutral-800 font-sans">
        <div className="max-w-md w-full p-6 rounded-3xl bg-white border border-red-200 shadow-sm text-center space-y-3">
          <AlertCircle size={36} className="text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-neutral-900">Summary Not Found</h2>
          <p className="text-xs text-neutral-600">{error || "This clinical pass may have expired."}</p>
        </div>
      </div>
    );
  }

  const content = summary.content_json;
  const dangerSigns = content.danger_signs || [];
  const recordedSymptoms = content.recorded_symptoms || [];
  const supplement = content.supplement_adherence;
  const nutrition = content.nutritional_variation;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Clinician Header Bar */}
        <header className="flex items-center justify-between bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center">
              <Stethoscope size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-neutral-900">
                  {summary.anc_contact_title || "Antenatal Care Clinical Intake"}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#2D6A4F]">
                  Target: {summary.target_gestational_weeks} Weeks
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                <Calendar size={13} />
                <span>
                  Monitoring Window: {summary.period_start} — {summary.period_end}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </header>

        {/* Danger Signs Triage Banner */}
        {dangerSigns.length > 0 ? (
          <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-300 text-red-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Urgent Danger Signs Logged ({dangerSigns.length})
                </h2>
              </div>
              <span className="text-xs font-bold bg-red-200 px-2 py-0.5 rounded-full">
                Action Required
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 pt-1">
              {dangerSigns.map((ds: any, i: number) => (
                <div key={i} className="p-3 bg-white rounded-2xl border border-red-200">
                  <p className="text-xs font-bold text-red-900">
                    {ds.category_display_en || ds.category_display || ds.raw_text}
                  </p>
                  <p className="text-[10px] text-red-700 mt-0.5">
                    Logged Date: {ds.date} • Severity: {ds.severity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-[#2D6A4F] flex-shrink-0" />
            <p className="text-xs font-medium">
              <strong>Obstetric Screen Clear:</strong> Zero severe headaches, epigastric pain, visual disturbances, or vaginal bleeding flagged during this period.
            </p>
          </div>
        )}

        {/* Adherence & Nutrition Dual Metric Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* IFA Adherence */}
          <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-[#2D6A4F]" />
                <h3 className="text-xs font-bold text-neutral-800">IFA & Micronutrient Prophylaxis</h3>
              </div>
              <span className="text-base font-extrabold text-[#2D6A4F]">
                {supplement?.percentage ?? 0}%
              </span>
            </div>

            <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2D6A4F] h-full rounded-full"
                style={{ width: `${supplement?.percentage ?? 0}%` }}
              />
            </div>

            <p className="text-[11px] text-neutral-500">
              Taken on {supplement?.taken_days ?? 0} of {supplement?.tracked_days ?? 0} active telemetry days (Total Window: {supplement?.total_days_in_period ?? 0} days).
            </p>
          </div>

          {/* Nutrition Diversity */}
          <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils size={18} className="text-amber-600" />
                <h3 className="text-xs font-bold text-neutral-800">Dietary Variation Score</h3>
              </div>
              <span className="text-xs font-bold text-amber-700">
                {nutrition?.tracked_days ?? 0} Days Tracked
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              {Object.entries(nutrition?.percentages || {}).map(([group, pct]: any) => (
                <div key={group} className="p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                  <span className="font-bold text-neutral-800 block capitalize truncate">
                    {group.replace("_", " ")}
                  </span>
                  <span className="text-[#2D6A4F] font-extrabold mt-0.5 block">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recorded Symptoms History */}
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Patient Self-Reported Symptoms Log
          </h3>

          {recordedSymptoms.length === 0 ? (
            <p className="text-xs text-neutral-400 py-2">No mild or moderate symptoms logged.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {recordedSymptoms.map((s: any, idx: number) => (
                <div key={idx} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-900">{s.raw_text || s.category_display}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Reported Date: {s.date} • Severity: {s.severity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinical Note / Provenance Footnote */}
        <footer className="p-4 rounded-2xl bg-neutral-200/60 border border-neutral-300 text-[11px] text-neutral-600 space-y-1">
          <p className="font-semibold text-neutral-800">
            Clinical Screening Notice: {content.muac_reminder || "Check MUAC and blood pressure at today's visit."}
          </p>
          <p className="italic">
            {content.provenance_note ||
              "All data in this report is self-reported by the mother via EnatAI voice check-ins (no device-measured data)."}
          </p>
        </footer>
      </div>
    </div>
  );
}