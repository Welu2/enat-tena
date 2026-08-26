"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { userService } from "@/services/user.service";
import { summaryService } from "@/services/summary.service";
import { UserProfile, ClinicianSummaryResponse, FoodGroup, SummaryDangerSign, SummarySymptom } from "@/types/api";
import {
  QrCode,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Pill,
  Utensils,
  Activity,
  CheckCircle2,
  Clock,
  Stethoscope,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isAm = lang === "am";

  // Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<ClinicianSummaryResponse | null>(null);

  // UI / Async States
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // =========================================================
  // Load User Profile and Latest Clinician Summary
  // =========================================================
  const loadReportData = useCallback(async (forceRegenerate = false) => {
    if (forceRegenerate) setIsRegenerating(true);
    setErrorToast(null);

    try {
      const userProfile = await userService.getProfile();
      if (!userProfile.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }
      setProfile(userProfile);

      let summaryData: ClinicianSummaryResponse;
      if (forceRegenerate) {
        summaryData = await summaryService.generateSummary();
      } else {
        try {
          summaryData = await summaryService.getLatestSummary();
        } catch {
          // If no summary exists yet, generate the first one
          summaryData = await summaryService.generateSummary();
        }
      }

      setSummary(summaryData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load clinical report";
      setErrorToast(msg);
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }, [router]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Public doctor view link
  const publicShareUrl = typeof window !== "undefined" && summary?.share_link_slug
    ? `${window.location.origin}/summary/${summary.share_link_slug}`
    : "";

  const handleCopyLink = () => {
    if (!publicShareUrl) return;
    navigator.clipboard.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // =========================================================
  // Derived Data & Formatting
  // =========================================================
  const userName =
    (typeof window !== "undefined" && localStorage.getItem("user_name")) ||
    profile?.email.split("@")[0] ||
    "Mother";

  const content = summary?.content_json;
  const dangerSigns = content?.danger_signs || [];
  const recordedSymptoms = content?.recorded_symptoms || [];
  const supplementAdherence = content?.supplement_adherence;
  const nutritionPercentages = content?.nutritional_variation?.percentages || {
    grains: 0,
    proteins: 0,
    dairy: 0,
    fruits_and_vegetables: 0,
  };

  const gaWeeks = profile?.current_pregnancy_status?.gestational_age_weeks ?? profile?.gestational_age_weeks ?? 0;
  const gaDays = profile?.current_pregnancy_status?.gestational_age_days ?? profile?.gestational_age_days ?? 0;
  const eddDate = profile?.current_pregnancy_status?.estimated_due_date || profile?.estimated_due_date || "";

  const contactTitle = isAm
    ? summary?.anc_contact_title_am || "የቅድመ ወሊድ ክትትል ሪፖርት"
    : summary?.anc_contact_title || "Antenatal Care Summary";

  const periodFormatted = summary
    ? `${summary.period_start} — ${summary.period_end}`
    : "";

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-dvh max-w-md mx-auto w-full flex flex-col justify-center items-center p-6 bg-[#FAF7F2] text-[#2C2723]">
        <Loader2 size={32} className="animate-spin text-[#2D6A4F] mb-3" />
        <p className="text-xs font-semibold text-[#7A7165]">
          {isAm ? "የክሊኒክ ሪፖርት መረጃዎችን በማዘጋጀት ላይ..." : "Compiling clinician ANC telemetry..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center">
      <div className="w-full max-w-md flex flex-col justify-between pb-24 font-sans select-none min-h-dvh">
        
        {/* Error Notification Toast */}
        {errorToast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
            <div className="p-3.5 rounded-2xl border border-red-200 bg-red-50/95 text-red-700 shadow-md flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <p className="text-xs font-semibold">{errorToast}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorToast(null)}
                className="text-xs text-red-500 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight">
                {isAm ? "የክሊኒክ የጤና ሪፖርት" : "Clinician ANC Report"}
              </h1>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                {periodFormatted}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => loadReportData(true)}
                disabled={isRegenerating}
                className="p-2 rounded-full text-[#7A7165] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                title={isAm ? "ሪፖርቱን እንደገና አዘጋጅ" : "Re-aggregate summary"}
              >
                <RefreshCw size={17} className={isRegenerating ? "animate-spin text-[#2D6A4F]" : ""} />
              </button>
              <Header />
            </div>
          </div>

          {/* Active Contact Header Badge */}
          <div className="mt-3 p-3 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center flex-shrink-0">
                <Stethoscope size={16} />
              </span>
              <div>
                <p className="text-[10px] font-semibold text-[#6B7280]">
                  {isAm ? "የተጠናቀረ የህክምና ወቅት" : "Active Aggregation Window"}
                </p>
                <p className="text-xs font-bold text-[#1F2937]">{contactTitle}</p>
              </div>
            </div>
            {summary?.target_gestational_weeks && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4EFE6] text-[#2D6A4F]">
                {summary.target_gestational_weeks}w Contact
              </span>
            )}
          </div>
        </header>

        {/* Main Telemetry Body */}
        <main className="flex-1 px-5 py-2 space-y-3.5 overflow-y-auto">
          {/* 1. Patient Clinical Profile Header Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8E1D5] shadow-xs space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-lg shadow-xs uppercase">
                  {userName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1F2937]">{userName}</h2>
                  <p className="text-xs text-[#6B7280]">
                    {profile?.hospital || (isAm ? "ቅዱስ ጳውሎስ ሆስፒታል" : "Hospital not set")}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 border px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  dangerSigns.length > 0
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-[#10B981]/15 text-[#2D6A4F] border-[#10B981]/30"
                }`}
              >
                {dangerSigns.length > 0 ? (
                  <>
                    <AlertTriangle size={13} className="text-red-600" />
                    <span>{isAm ? "የአደጋ ምልክት" : "Danger Flag"}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={13} className="text-[#2D6A4F]" />
                    <span>{isAm ? "መደበኛ ሁኔታ" : "Low Risk"}</span>
                  </>
                )}
              </div>
            </div>

            {/* Vitals & Demographics Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5]">
                <p className="text-[10px] font-semibold text-[#6B7280]">
                  {isAm ? "የእርግዝና ዕድሜ" : "Current GA"}
                </p>
                <p className="text-xs font-bold text-[#2D6A4F] mt-0.5">
                  {gaWeeks}w + {gaDays}d
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5]">
                <p className="text-[10px] font-semibold text-[#6B7280]">
                  {isAm ? "ታሪክ (G/P)" : "Obstetric"}
                </p>
                <p className="text-xs font-bold text-[#1F2937] mt-0.5">
                  G{profile?.total_pregnancies || 1} P{profile?.live_births || 0}
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5]">
                <p className="text-[10px] font-semibold text-[#6B7280]">
                  {isAm ? "የመውለጃ ቀን" : "Due Date"}
                </p>
                <p className="text-xs font-bold text-[#1F2937] mt-0.5 truncate">
                  {eddDate || "TBD"}
                </p>
              </div>
            </div>

            {/* Clinician Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="flex-1 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <QrCode size={14} />
                <span>{isAm ? "ለሀኪም በQR አሳይ" : "Doctor QR Pass"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E1D5] text-[#1F2937] text-xs font-semibold hover:bg-neutral-50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <Share2 size={13} className="text-[#6B7280]" />
                <span>{copied ? (isAm ? "ኮፒ ተደርጓል!" : "Copied!") : isAm ? "አጋራ" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* 2. Prophylaxis & Nutrition Compliance Scorecards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Supplement Adherence Card */}
            <div className="bg-white rounded-3xl p-4 border border-[#E8E1D5] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                  <Pill size={15} />
                </span>
                <span className="text-xs font-extrabold text-[#2D6A4F]">
                  {supplementAdherence?.percentage ?? 0}%
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1F2937]">
                  {isAm ? "የማሟያ ተገዢነት" : "Supplement Intake"}
                </h3>
                <p className="text-[10px] text-[#6B7280] mt-0.5">
                  {isAm
                    ? `ከ${supplementAdherence?.tracked_days ?? 0} ቀናት ${supplementAdherence?.taken_days ?? 0} ቀን ተወስዷል`
                    : `${supplementAdherence?.taken_days ?? 0} of ${supplementAdherence?.tracked_days ?? 0} tracked days`}
                </p>
              </div>
            </div>

            {/* Nutrition Tracking Card */}
            <div className="bg-white rounded-3xl p-4 border border-[#E8E1D5] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Utensils size={15} />
                </span>
                <span className="text-xs font-extrabold text-amber-700">
                  {content?.nutritional_variation?.tracked_days ?? 0}d Logged
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1F2937]">
                  {isAm ? "የምግብ ምዝገባ" : "Diet Diversity"}
                </h3>
                <p className="text-[10px] text-[#6B7280] mt-0.5 truncate">
                  {content?.nutritional_variation?.total_items_classified ?? 0} {isAm ? "ምግቦች ተለይተዋል" : "items classified"}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Obstetric Danger Signs Screen */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    dangerSigns.length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-[#2D6A4F]"
                  }`}
                >
                  {dangerSigns.length > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#1F2937]">
                  {isAm ? "የአደጋ ምልክቶች ክትትል" : "Obstetric Danger Signs Screen"}
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dangerSigns.length === 0
                    ? "bg-[#E8F5E9] text-[#2D6A4F]"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {dangerSigns.length === 0
                  ? isAm ? "0 ተገኝቷል (ደህና)" : "0 Active (Clear)"
                  : `${dangerSigns.length} ${isAm ? "የአደጋ ምልክት" : "Flagged"}`}
              </span>
            </div>

            {dangerSigns.length === 0 ? (
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {isAm
                  ? "በዚህ የክትትል ወቅት ውስጥ ምንም ዓይነት ጽኑ ራስ ምታት፣ የዓይን ብዥታ፣ ደም መፍሰስ ወይም ፈሳሽ መፍሰስ አልተመዘገበም።"
                  : "No severe headaches, visual disturbances, vaginal bleeding, or fluid leakages reported during this window."}
              </p>
            ) : (
              <div className="space-y-1.5 pt-1">
                {dangerSigns.map((ds: SummaryDangerSign, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-red-50/80 border border-red-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-red-900">
                        {isAm ? ds.category_display || ds.raw_text : ds.category_display_en || ds.raw_text}
                      </p>
                      <p className="text-[10px] text-red-700 mt-0.5">
                        {ds.date} {ds.duration?.value ? `• ${ds.duration.value} ${ds.duration.unit}` : ""}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-800 uppercase">
                      {ds.severity || "Severe"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Logged Non-Danger Symptoms */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                <Activity size={15} className="text-[#2D6A4F]" />
                <span>{isAm ? "የተመዘገቡ አጠቃላይ ምልክቶች" : "General Symptoms Logged"}</span>
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280]">
                {recordedSymptoms.length} {isAm ? "ምልክቶች" : "records"}
              </span>
            </div>

            {recordedSymptoms.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">
                {isAm ? "ምንም የተመዘገበ ምልክት የለም" : "No non-danger symptoms reported"}
              </p>
            ) : (
              <div className="space-y-2">
                {recordedSymptoms.map((s: SummarySymptom, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">
                        {s.raw_text || s.category_display}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">{s.date}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#2D6A4F]">
                      {s.severity || "Mild"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Food Group Coverage Breakdown */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <span className="text-xs sm:text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
              <Utensils size={15} className="text-amber-600" />
              <span>{isAm ? "የዕለታዊ ምግቦች ድርሻ (%)" : "WHO 4-Food-Group Share (%)"}</span>
            </span>

            <div className="space-y-2.5">
              {[
                {
                  key: "grains" as FoodGroup,
                  nameAm: "እህል (እንጀራ/ዳቦ/አጃ)",
                  nameEn: "Grains & Injera",
                  pct: nutritionPercentages.grains || 0,
                },
                {
                  key: "proteins" as FoodGroup,
                  nameAm: "ፕሮቲን (ስጋ/እንቁላል/ሽሮ)",
                  nameEn: "Proteins & Legumes",
                  pct: nutritionPercentages.proteins || 0,
                },
                {
                  key: "dairy" as FoodGroup,
                  nameAm: "የወተት ተዋፅኦ",
                  nameEn: "Dairy Products",
                  pct: nutritionPercentages.dairy || 0,
                },
                {
                  key: "fruits_and_vegetables" as FoodGroup,
                  nameAm: "አትክልትና ፍራፍሬ",
                  nameEn: "Fruits & Vegetables",
                  pct: nutritionPercentages.fruits_and_vegetables || 0,
                },
              ].map((group) => (
                <div key={group.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#1F2937]">{isAm ? group.nameAm : group.nameEn}</span>
                    <span className="text-[#6B7280]">{group.pct}%</span>
                  </div>
                  <div className="w-full bg-[#F3EFE6] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2D6A4F] h-full rounded-full transition-all duration-500"
                      style={{ width: `${group.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Clinical Guidance & Screening Notes */}
          <div className="bg-gradient-to-br from-[#2D6A4F]/10 to-[#1E4D38]/5 rounded-3xl p-4 sm:p-5 border border-[#2D6A4F]/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F]">
              <Stethoscope size={15} />
              <span>{isAm ? "የክሊኒካል መመሪያ እና ማሳሰቢያ" : "Clinical Synthesis & Guidance"}</span>
            </div>
            {content?.muac_reminder && (
              <p className="text-xs text-[#2D6A4F] font-bold">
                • {content.muac_reminder}
              </p>
            )}
            <p className="text-[11px] text-[#7A7165] leading-relaxed">
              {content?.provenance_note ||
                "All telemetry in this summary is self-reported by the patient through voice check-ins."}
            </p>
          </div>
        </main>

        {/* Clinician QR Pass Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
              <div className="inline-flex p-3 bg-purple-50 text-purple-700 rounded-2xl">
                <QrCode size={36} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1F2937]">
                  {isAm ? "ለሀኪም ማሳያ የክሊኒክ QR" : "Clinician QR Pass"}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  {isAm
                    ? `${contactTitle} መረጃን ለሀኪም ያጋሩ`
                    : `Present QR token for ${contactTitle}`}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#D6C7B2] flex flex-col items-center justify-center space-y-2">
                <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center border border-gray-200">
                  {summary?.qr_code_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={summary.qr_code_url}
                      alt="Clinician Pass QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode size={130} className="text-[#1F2937]" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2D6A4F]">
                  <Clock size={12} />
                  <span>{isAm ? "ለ15 ደቂቃዎች ይሰራል" : "Valid for clinical intake"}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-3 rounded-2xl bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1E4D38] transition-colors cursor-pointer"
              >
                {isAm ? "ዝጋ" : "Done"}
              </button>
            </div>
          </div>
        )}

        {/* Global Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}