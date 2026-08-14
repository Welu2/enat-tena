"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function ReportPage() {
  const { t } = useLanguage();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Enat Tena Clinician Report",
        text: "Health Summary Report for Sara Teka",
        url: window.location.href,
      });
    } else {
      alert("Report link copied to clipboard!");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh">
      {/* Top Clinician Green Hero Card */}
      <div className="bg-[#2B5140] text-white px-6 sm:px-7 pt-16 pb-6 relative">
        <Header />

        <div className="flex items-start justify-between mt-2">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-white/70">
              {t.clinicianReport}
            </p>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">{t.healthSummary}</h1>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{t.share}</span>
          </button>
        </div>

        {/* Patient & Period Meta Pill Cards */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider">
              {t.patientLabel}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">{t.patientName}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider">
              {t.periodLabel}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">{t.periodValue}</p>
          </div>
        </div>
      </div>

      {/* Main Report Body */}
      <main className="flex-1 px-6 sm:px-7 py-4 space-y-3.5 overflow-y-auto">
        {/* Danger Signs Section */}
        <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E2ECE6] text-brand-green flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-text">{t.dangerSignsTitle}</h3>
            <p className="text-xs text-brand-subtle mt-0.5">{t.dangerSignsNone}</p>
          </div>
        </div>

        {/* Supplement Adherence Section */}
        <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E2ECE6] text-brand-green flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-text">{t.supplementAdherence}</h3>
              <p className="text-xs text-brand-subtle mt-0.5">{t.supplementTypes}</p>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="h-2 flex-1 bg-[#EAE2D5] rounded-full overflow-hidden mr-3">
                <div className="h-full bg-brand-green rounded-full w-[80%]" />
              </div>
              <span className="text-xs font-bold text-brand-text">{t.adherenceRatio}</span>
            </div>
            <p className="text-[11px] text-brand-subtle italic">{t.selfReported}</p>
          </div>
        </div>

        {/* Symptoms Log Section */}
        <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8EFEA] text-brand-green flex items-center justify-center">
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-brand-text">{t.symptomsLog}</h3>
          </div>

          <div className="divide-y divide-[#EDE5DA] text-xs pt-1 space-y-2">
            <div className="flex justify-between pt-1">
              <span className="text-brand-subtle font-medium">Aug 12</span>
              <span className="text-brand-text font-bold">{t.swelling}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-brand-subtle font-medium">Aug 10</span>
              <span className="text-brand-text font-bold">{t.mildHeadache}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-brand-subtle font-medium">Aug 9</span>
              <span className="text-brand-text font-bold">{t.fatigueFaceSwelling}</span>
            </div>
          </div>
          <p className="text-[11px] text-brand-subtle italic pt-1">{t.noSymptomsDays}</p>
        </div>

        {/* Food Log Section */}
        <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0ECE1] text-[#7E6F5E] flex items-center justify-center">
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-brand-text">{t.foodLog}</h3>
          </div>

          <div className="divide-y divide-[#EDE5DA] text-xs space-y-2 pt-1">
            <div className="flex justify-between items-start pt-1">
              <span className="text-brand-subtle font-medium w-16">Aug 12</span>
              <span className="text-brand-text text-right font-medium flex-1">
                እንጀራ ከ ክክ ፍጥፍጥ ጋር, ፍራፍሬ
              </span>
            </div>
            <div className="flex justify-between items-start pt-2">
              <span className="text-brand-subtle font-medium w-16">Aug 11</span>
              <span className="text-brand-text text-right font-medium flex-1">
                ዳቦ ከ አቮካዶ ጋር, አትክልት ሾርባ
              </span>
            </div>
            <div className="flex justify-between items-start pt-2">
              <span className="text-brand-subtle font-medium w-16">Aug 10</span>
              <span className="text-brand-text text-right font-medium flex-1">
                እንጀራ ከ ምስር ጋር
              </span>
            </div>
            <div className="flex justify-between items-start pt-2">
              <span className="text-brand-subtle font-medium w-16">Aug 9</span>
              <span className="text-brand-text text-right font-medium flex-1">
                እንጀራ ከ ቅቤ ጋር, ወጥ
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer Note Card */}
        <div className="bg-[#E4ECE7] border border-[#D0DFD6] p-4 rounded-2xl">
          <p className="text-[11px] text-[#294B3B] leading-relaxed">
            <strong className="font-bold">Note:</strong> {t.disclaimerNote}{" "}
            <span className="block mt-1 font-semibold">{t.generatedDate}</span>
          </p>
        </div>

        {/* Next Appointment Card */}
        <div className="bg-[#EFE8DC] border border-[#E0D5C5] p-3.5 rounded-2xl text-center">
          <p className="text-xs font-bold text-brand-text">{t.nextAppointmentBanner}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}