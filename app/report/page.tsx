"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useClinicianReport } from "@/hooks/useClinicianReport";
import {
  parseContentJson,
  buildDoctorShareUrl,
  formatSummaryPeriod,
} from "@/utils/reportHelpers";
import { ReportToast } from "@/components/report/ReportToast";
import { ReportHeroCard } from "@/components/report/ReportHeroCard";
import { DangerSignsSection } from "@/components/report/DangerSignsSection";
import {
  MuacReminderSection,
} from "@/components/report/MuacReminderSection";
import {
  SupplementAdherenceSection,
} from "@/components/report/SupplementAdherenceSection";
import {
  SymptomsLogSection,
} from "@/components/report/SymptomsLogSection";
import { FoodLogSection } from "@/components/report/FoodLogSection";
import {
  ProvenanceNoteSection,
} from "@/components/report/ProvenanceNoteSection";
import {
  NextAppointmentBanner,
} from "@/components/report/NextAppointmentBanner";
import { QrCodeModal } from "@/components/report/QrCodeModal";

export default function ReportPage() {
  const { t, lang } = useLanguage();
  const { toast, showToast } = useToast();
  const [showQRModal, setShowQRModal] = useState(false);

  const {
    summary,
    patientName,
    appointmentDate,
    isLoading,
    isGenerating,
    fetchError,
    initReport,
    handleRegenerate,
  } = useClinicianReport(showToast, lang);

  const content = parseContentJson(summary);
  const symptoms =
    content?.general_symptoms ||
    (content as { symptoms_summary?: any })?.symptoms_summary ||
    [];
  const dangerSigns = content?.danger_signs || [];
  const foodLogs = content?.food_logs || [];
  const publicDoctorUrl = buildDoctorShareUrl(summary?.share_link_slug);

  const handleShare = async () => {
    if (!publicDoctorUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "EnatAI Clinician Summary Report",
          text: `Antenatal Care Health Summary for ${patientName}`,
          url: publicDoctorUrl,
        });
      } catch {
        /* User dismissed share dialog */
      }
    } else {
      await navigator.clipboard.writeText(publicDoctorUrl);
      showToast(
        lang === "am"
          ? "የሪፖርቱ ሊንክ ኮፒ ተደርጓል!"
          : "Public clinician link copied to clipboard!"
      );
    }
  };

  const periodRange = formatSummaryPeriod(
    summary?.period_start,
    summary?.period_end,
    content,
    lang,
    t?.periodValue || "Recent"
  );

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8 select-none font-sans">
      <ReportToast message={toast?.message || null} />

      <ReportHeroCard
        title={
          t?.healthSummary ||
          (lang === "am" ? "የጤና ማጠቃለያ" : "Health Summary")
        }
        subtitle={
          t?.clinicianReport ||
          (lang === "am" ? "የህክምና ባለሙያ ሪፖርት" : "Clinician Summary")
        }
        patientLabel={
          t?.patientLabel || (lang === "am" ? "የእናቷ ስም" : "Patient")
        }
        patientName={patientName}
        periodLabel={
          t?.periodLabel || (lang === "am" ? "የቆይታ ጊዜ" : "Period")
        }
        periodRange={periodRange}
        shareLabel={t?.share || (lang === "am" ? "አጋራ" : "Share")}
        hasSummary={Boolean(summary)}
        isGenerating={isGenerating}
        onRegenerate={handleRegenerate}
        onOpenQR={() => setShowQRModal(true)}
        onShare={handleShare}
      />

      <main className="flex-1 px-6 sm:px-7 py-4 space-y-3.5 overflow-y-auto">
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            <p className="text-xs font-semibold text-brand-subtle">
              {lang === "am"
                ? "የቅርብ ጊዜውን ሪፖርት በማዘጋጀት ላይ..."
                : "Loading latest clinician report..."}
            </p>
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={initReport}
              className="font-bold underline ml-2 cursor-pointer"
            >
              {lang === "am" ? "እንደገና ሞክር" : "Retry"}
            </button>
          </div>
        )}

        {!isLoading && summary && (
          <>
            <DangerSignsSection
              title={
                t?.dangerSignsTitle ||
                (lang === "am" ? "የአደጋ ምልክቶች" : "Danger Signs")
              }
              noSignsText={
                t?.dangerSignsNone ||
                (lang === "am"
                  ? "በዚህ ወቅት ምንም የአደጋ ምልክት አልተመዘገበም"
                  : "No danger signs reported during this period.")
              }
              dangerSigns={dangerSigns}
            />

            {content?.muac_reminder && (
              <MuacReminderSection
                title={
                  lang === "am"
                    ? "የክንድ ዙሪያ (MUAC) ምርመራ"
                    : "Nutritional MUAC Screening"
                }
                reminderText={content.muac_reminder}
              />
            )}

            <SupplementAdherenceSection
              title={
                t?.supplementAdherence ||
                (lang === "am"
                  ? "የመድሃኒት አወሳሰድ"
                  : "Supplement Adherence")
              }
              selfReportedLabel={
                t?.selfReported ||
                (lang === "am"
                  ? "በእናትየው ሪፖርት የተደረገ"
                  : "Self-reported")
              }
              emptyLabel={
                lang === "am"
                  ? "ምንም የመድሃኒት መረጃ አልተመዘገበም"
                  : "No supplement logs recorded in this period"
              }
              adherence={content?.supplement_adherence}
              language={lang}
            />

            <SymptomsLogSection
              title={
                t?.symptomsLog ||
                (lang === "am" ? "የተመዘገቡ ምልክቶች" : "Symptoms Log")
              }
              emptyLabel={
                t?.noSymptomsDays ||
                (lang === "am"
                  ? "ምንም የተመዘገበ ምልክት የለም"
                  : "No symptoms reported.")
              }
              symptoms={symptoms}
              language={lang}
            />

            <FoodLogSection
              title={
                t?.foodLog ||
                (lang === "am" ? "የምግብ መዝገብ" : "Food Log")
              }
              emptyLabel={
                lang === "am"
                  ? "ምንም የምግብ መረጃ አልተመዘገበም"
                  : "No food logs recorded"
              }
              logs={foodLogs}
              language={lang}
            />

            <ProvenanceNoteSection
              title={
                lang === "am"
                  ? "የመረጃ ትክክለኛነት ማስታወሻ"
                  : "Clinical Data Note"
              }
              noteText={
                content?.provenance_note ||
                t?.disclaimerNote ||
                "All data in this summary is self-reported by the patient."
              }
              generatedAt={summary.generated_at}
              language={lang}
            />

            {appointmentDate && (
              <NextAppointmentBanner
                label={
                  t?.nextAppointmentBanner ||
                  (lang === "am" ? "ቀጣይ ቀጠሮ" : "Next Appointment")
                }
                dateStr={appointmentDate}
                language={lang}
              />
            )}
          </>
        )}
      </main>

      <QrCodeModal
        isOpen={showQRModal}
        qrCodeUrl={summary?.qr_code_url}
        shareSlug={summary?.share_link_slug}
        publicDoctorUrl={publicDoctorUrl}
        language={lang}
        onClose={() => setShowQRModal(false)}
        onShare={handleShare}
      />

      <BottomNav />
    </div>
  );
}