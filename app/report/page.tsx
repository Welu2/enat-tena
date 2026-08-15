"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import {
  getLatestSummary,
  generateSummary,
  getUserProfile,
  ClinicianSummary,
} from "@/lib/api";
import { formatSyncedDate } from "@/lib/dateUtils";
import {
  Loader2,
  Share2,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  RefreshCw,
  X,
  Calendar,
  Pill,
  Utensils,
  Activity,
  AlertCircle,
  Scale,
  ShieldCheck,
} from "lucide-react";

// Self-contained interface to guarantee zero TypeScript build errors
interface ReportContent {
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
}

export default function ReportPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [summary, setSummary] = useState<ClinicianSummary | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Safely parse content_json regardless of type
  const parseContentJson = (data: ClinicianSummary): ReportContent | undefined => {
    if (!data.content_json) return undefined;
    if (typeof data.content_json === "string") {
      try {
        return JSON.parse(data.content_json);
      } catch {
        return undefined;
      }
    }
    return data.content_json as ReportContent;
  };

  // 1. Fetch Backend Data: User Profile (Dynamic Name & Appointment Date) + Latest Summary
  const initReportData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    const cachedName = typeof window !== "undefined" ? localStorage.getItem("user_name") : null;
    const cachedEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : null;

    try {
      // Step A: Fetch profile from backend for live appointment date and resolved name
      try {
        const profile = await getUserProfile();
        if (profile) {
          if (profile.appointment?.appointment_date) {
            setAppointmentDate(profile.appointment.appointment_date);
          } else if (profile.next_appointment_date) {
            setAppointmentDate(profile.next_appointment_date);
          }

          // Dynamic Name Resolution Hierarchy:
          // 1. profile.full_name
          // 2. localStorage user_name
          // 3. profile.email prefix
          // 4. localStorage user_email prefix
          // 5. Fallback: "ያልታወቀ" / "Unknown"
          let resolvedName = "";
          if (profile.full_name && profile.full_name.trim() !== "") {
            resolvedName = profile.full_name.trim();
          } else if (cachedName && cachedName.trim() !== "") {
            resolvedName = cachedName.trim();
          } else if (profile.email && profile.email.includes("@")) {
            const prefix = profile.email.split("@")[0];
            resolvedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          } else if (cachedEmail && cachedEmail.includes("@")) {
            const prefix = cachedEmail.split("@")[0];
            resolvedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          } else {
            resolvedName = lang === "am" ? "ያልታወቀ" : "Unknown";
          }

          setPatientName(resolvedName);
          if (resolvedName && resolvedName !== "ያልታወቀ" && resolvedName !== "Unknown") {
            localStorage.setItem("user_name", resolvedName);
          }
        }
      } catch (profileErr) {
        console.warn("Could not fetch user profile from backend:", profileErr);
      }

      // Step B: Fetch latest summary or auto-generate initial report
      const latest = await getLatestSummary();
      if (latest) {
        setSummary(latest);
      } else {
        const newlyGenerated = await generateSummary();
        setSummary(newlyGenerated);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error initializing report:", error);
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        localStorage.removeItem("access_token");
        router.replace("/login");
        return;
      }
      setFetchError(error.message || "Failed to load clinician report.");
    } finally {
      setIsLoading(false);
    }
  }, [lang, router]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    const cachedName = localStorage.getItem("user_name");
    const cachedEmail = localStorage.getItem("user_email");
    if (cachedName && cachedName.trim()) {
      setPatientName(cachedName.trim());
    } else if (cachedEmail && cachedEmail.includes("@")) {
      const prefix = cachedEmail.split("@")[0];
      setPatientName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
    }

    initReportData();
  }, [router, initReportData]);

  // 2. Manual Regeneration Action
  const handleRegenerateReport = async () => {
    setIsGenerating(true);
    setFetchError(null);
    try {
      const newSummary = await generateSummary();
      setSummary(newSummary);
      triggerToast(
        lang === "am"
          ? "የህክምና ሪፖርት በአዲስ መልኩ ተዘጋጅቷል!"
          : "Clinician summary updated successfully!"
      );
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to regenerate summary:", error);
      triggerToast(
        error.message ||
          (lang === "am" ? "ሪፖርቱን ማመንጨት አልተቻለም።" : "Failed to generate report.")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Construct Doctor Sharing Link
  const getPublicDoctorUrl = () => {
    if (!summary?.share_link_slug) return "";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" && window.location.origin.includes("localhost")
        ? "https://enat-tena.onrender.com"
        : typeof window !== "undefined"
        ? window.location.origin
        : "https://enat-tena.onrender.com");

    return `${siteUrl}/summary/public/${summary.share_link_slug}`;
  };

  // Share Link Handler
  const handleShare = async () => {
    const publicUrl = getPublicDoctorUrl();
    if (!publicUrl) return;

    const displayName = patientName || (lang === "am" ? "ያልታወቀ" : "Unknown");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "EnatAI Clinician Summary Report",
          text: `Antenatal Care Health Summary for ${displayName}`,
          url: publicUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      await navigator.clipboard.writeText(publicUrl);
      triggerToast(
        lang === "am"
          ? "የሪፖርቱ ሊንክ ኮፒ ተደርጓል!"
          : "Public clinician link copied to clipboard!"
      );
    }
  };

  const formatPeriodRange = () => {
    if (!summary?.period_start || !summary?.period_end) return t?.periodValue || "Recent";
    try {
      const startFormatted = formatSyncedDate(new Date(summary.period_start), lang);
      const endFormatted = formatSyncedDate(new Date(summary.period_end), lang);
      return `${startFormatted.month} ${startFormatted.dayNum} – ${endFormatted.month} ${endFormatted.dayNum}`;
    } catch {
      return `${summary.period_start} – ${summary.period_end}`;
    }
  };

  const formatLogDate = (rawDate?: string) => {
    if (!rawDate) return lang === "am" ? "የቅርብ" : "Recent";
    try {
      const parsed = new Date(rawDate);
      if (isNaN(parsed.getTime())) return rawDate;
      const formatted = formatSyncedDate(parsed, lang);
      return `${formatted.month} ${formatted.dayNum}`;
    } catch {
      return rawDate;
    }
  };

  // Extract parsed fields
  const content = summary ? parseContentJson(summary) : undefined;
  const symptoms = content?.general_symptoms || content?.symptoms_summary || [];
  const dangerSigns = content?.danger_signs || [];
  const foodLogs = content?.food_logs || [];
  const adherence = content?.supplement_adherence;
  const adherencePercent = adherence ? Math.round(adherence.percentage) : 0;
  const muacReminder = content?.muac_reminder;
  const provenanceNote = content?.provenance_note;
  const displayName = patientName || (lang === "am" ? "ያልታወቀ" : "Unknown");

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8 select-none font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-2xl border shadow-lg flex items-center gap-3 backdrop-blur-md bg-[#F0F7F3]/95 border-[#C8E1D3] text-brand-green">
            <CheckCircle2 size={18} className="flex-shrink-0" />
            <p className="text-xs font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Top Clinician Hero Card */}
      <div className="bg-[#2B5140] text-white px-6 sm:px-7 pt-16 pb-6 relative">
        <Header />

        <div className="flex items-start justify-between mt-2">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-white/70">
              {t?.clinicianReport || (lang === "am" ? "የህክምና ባለሙያ ሪፖርት" : "Clinician Summary")}
            </p>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">
              {t?.healthSummary || (lang === "am" ? "የጤና ማጠቃለያ" : "Health Summary")}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {summary && (
              <>
                <button
                  type="button"
                  onClick={handleRegenerateReport}
                  disabled={isGenerating}
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Regenerate Report"
                >
                  <RefreshCw size={15} className={isGenerating ? "animate-spin" : ""} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                  title="Show QR Code"
                >
                  <QrCode size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>{t?.share || (lang === "am" ? "አጋራ" : "Share")}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Patient & Period Meta Cards */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider">
              {t?.patientLabel || (lang === "am" ? "የእናቷ ስም" : "Patient")}
            </p>
            <p className="text-sm font-bold text-white mt-0.5 truncate">{displayName}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider">
              {t?.periodLabel || (lang === "am" ? "የቆይታ ጊዜ" : "Period")}
            </p>
            <p className="text-sm font-bold text-white mt-0.5 truncate">
              {formatPeriodRange()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Report Body */}
      <main className="flex-1 px-6 sm:px-7 py-4 space-y-3.5 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            <p className="text-xs font-semibold text-brand-subtle">
              {lang === "am" ? "የቅርብ ጊዜውን ሪፖርት በማዘጋጀት ላይ..." : "Loading latest clinician report..."}
            </p>
          </div>
        )}

        {/* Fetch Error Display */}
        {!isLoading && fetchError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={initReportData}
              className="font-bold underline ml-2 cursor-pointer"
            >
              {lang === "am" ? "እንደገና ሞክር" : "Retry"}
            </button>
          </div>
        )}

        {/* Report Content View */}
        {!isLoading && summary && (
          <>
            {/* Danger Signs Section */}
            <div
              className={`p-4 rounded-3xl flex items-start gap-3.5 border transition-all ${
                dangerSigns.length > 0
                  ? "bg-red-50/70 border-red-200"
                  : "bg-[#FAF7F2] border-[#E4DCD0]"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  dangerSigns.length > 0
                    ? "bg-red-100 text-red-600"
                    : "bg-[#E2ECE6] text-brand-green"
                }`}
              >
                {dangerSigns.length > 0 ? (
                  <AlertTriangle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-brand-text">
                  {t?.dangerSignsTitle || (lang === "am" ? "የአደጋ ምልክቶች" : "Danger Signs")}
                </h3>
                {dangerSigns.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {dangerSigns.map(
                      (
                        ds: { raw_text?: string; category?: string } | string,
                        idx: number
                      ) => (
                        <p key={idx} className="text-xs font-semibold text-red-700">
                          • {typeof ds === "string" ? ds : ds.raw_text || ds.category}
                        </p>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-brand-subtle mt-0.5">
                    {t?.dangerSignsNone ||
                      (lang === "am"
                        ? "በዚህ ወቅት ምንም የአደጋ ምልክት አልተመዘገበም"
                        : "No danger signs reported during this period.")}
                  </p>
                )}
              </div>
            </div>

            {/* MUAC Nutrition Screening Reminder */}
            {muacReminder && (
              <div className="p-4 rounded-3xl bg-[#FFF8EE] border border-[#F2DEBA] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FEEBC8] text-[#C05621] flex items-center justify-center flex-shrink-0">
                  <Scale size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#7B341E]">
                    {lang === "am" ? "የክንድ ዙሪያ (MUAC) ምርመራ" : "Nutritional MUAC Screening"}
                  </h3>
                  <p className="text-xs text-[#9C4221] mt-0.5 font-medium">
                    {muacReminder}
                  </p>
                </div>
              </div>
            )}

            {/* Supplement Adherence Section */}
            <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E2ECE6] text-brand-green flex items-center justify-center flex-shrink-0">
                  <Pill size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text">
                    {t?.supplementAdherence || (lang === "am" ? "የመድሃኒት አወሳሰድ" : "Supplement Adherence")}
                  </h3>
                  <p className="text-xs text-brand-subtle mt-0.5">
                    {adherence
                      ? `${adherence.taken_days} / ${adherence.total_reported} ${
                          lang === "am" ? "ቀናት ተወስዷል" : "days reported"
                        }`
                      : lang === "am"
                      ? "ምንም የመድሃኒት መረጃ አልተመዘገበም"
                      : "No supplement logs recorded in this period"}
                  </p>
                </div>
              </div>

              {adherence ? (
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="h-2 flex-1 bg-[#EAE2D5] rounded-full overflow-hidden mr-3">
                      <div
                        className="h-full bg-brand-green rounded-full transition-all duration-500"
                        style={{ width: `${adherencePercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-brand-text">
                      {adherencePercent}%
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-subtle italic">
                    {t?.selfReported || (lang === "am" ? "በእናትየው ሪፖርት የተደረገ" : "Self-reported")}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Symptoms Log Section */}
            <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8EFEA] text-brand-green flex items-center justify-center flex-shrink-0">
                  <Activity size={17} />
                </div>
                <h3 className="text-sm font-bold text-brand-text">
                  {t?.symptomsLog || (lang === "am" ? "የተመዘገቡ ምልክቶች" : "Symptoms Log")}
                </h3>
              </div>

              {symptoms.length > 0 ? (
                <div className="divide-y divide-[#EDE5DA] text-xs pt-1 space-y-2">
                  {symptoms.map(
                    (
                      item: { date?: string; raw_text?: string; symptom?: string },
                      idx: number
                    ) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center pt-2 first:pt-0"
                      >
                        <span className="text-brand-subtle font-medium">
                          {formatLogDate(item.date)}
                        </span>
                        <span className="text-brand-text font-bold">
                          {item.raw_text || item.symptom}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-brand-subtle italic pt-1">
                  {t?.noSymptomsDays || (lang === "am" ? "ምንም የተመዘገበ ምልክት የለም" : "No symptoms reported.")}
                </p>
              )}
            </div>

            {/* Food Log Section */}
            <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F0ECE1] text-[#7E6F5E] flex items-center justify-center flex-shrink-0">
                  <Utensils size={17} />
                </div>
                <h3 className="text-sm font-bold text-brand-text">
                  {t?.foodLog || (lang === "am" ? "የምግብ መዝገብ" : "Food Log")}
                </h3>
              </div>

              {foodLogs.length > 0 ? (
                <div className="divide-y divide-[#EDE5DA] text-xs space-y-2 pt-1">
                  {foodLogs.map(
                    (item: { date?: string; raw_text: string }, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start pt-2 first:pt-0 gap-3"
                      >
                        <span className="text-brand-subtle font-medium w-20 flex-shrink-0">
                          {formatLogDate(item.date)}
                        </span>
                        <span className="text-brand-text text-right font-medium flex-1">
                          {item.raw_text}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-brand-subtle italic pt-1">
                  {lang === "am" ? "ምንም የምግብ መረጃ አልተመዘገበም" : "No food logs recorded"}
                </p>
              )}
            </div>

            {/* Provenance & Disclaimer Note Card */}
            <div className="bg-[#E4ECE7] border border-[#D0DFD6] p-4 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-brand-green">
                <ShieldCheck size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">
                  {lang === "am" ? "የመረጃ ትክክለኛነት ማስታወሻ" : "Clinical Data Note"}
                </p>
              </div>
              <p className="text-[11px] text-[#294B3B] leading-relaxed">
                {provenanceNote || t?.disclaimerNote || "All data in this summary is self-reported by the patient."}
              </p>
              <p className="text-[10px] text-brand-subtle font-medium pt-1">
                {lang === "am" ? "የተዘጋጀበት ቀን፦ " : "Generated: "}
                {summary.generated_at ? formatSyncedDate(new Date(summary.generated_at), lang).full : ""}
              </p>
            </div>

            {/* Next Appointment Card (Fetched from Backend) */}
            {appointmentDate && (
              <div className="bg-[#EFE8DC] border border-[#E0D5C5] p-3.5 rounded-2xl text-center flex items-center justify-center gap-2">
                <Calendar size={14} className="text-brand-green" />
                <p className="text-xs font-bold text-brand-text">
                  {t?.nextAppointmentBanner || (lang === "am" ? "ቀጣይ ቀጠሮ" : "Next Appointment")}:{" "}
                  {formatSyncedDate(new Date(appointmentDate), lang).full}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Doctor QR Code Modal */}
      {showQRModal && summary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl p-6 w-full max-w-sm relative text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="absolute right-4 top-4 text-brand-subtle hover:text-brand-text p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="text-base font-bold text-brand-text">
                {lang === "am" ? "የሀኪም መመልከቻ QR ኮድ" : "Clinician Review QR"}
              </h3>
              <p className="text-xs text-brand-subtle">
                {lang === "am"
                  ? "ሀኪምዎ ይህንን QR ኮድ ስካን በማድረግ ሙሉ ሪፖርትዎን ማየት ይችላሉ።"
                  : "Let your healthcare provider scan this code to review your summary."}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E4DCD0] inline-block shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  summary.qr_code_url ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    getPublicDoctorUrl()
                  )}`
                }
                alt="Clinician QR Code"
                className="w-44 h-44 mx-auto rounded-lg object-contain"
              />
            </div>

            <p className="text-[11px] font-mono text-brand-subtle uppercase">
              Slug: {summary.share_link_slug}
            </p>

            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 size={14} />
              <span>{lang === "am" ? "ሊንኩን አጋራ" : "Share Web Link"}</span>
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}