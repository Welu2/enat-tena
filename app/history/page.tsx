"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

interface HistoryRecord {
  day: string;
  dateNum: string;
  month: string;
  symptom: string;
  hasSupplement: boolean;
  foodSummary: string;
}

export default function HistoryPage() {
  const { t } = useLanguage();

  const historyRecords: HistoryRecord[] = [
    {
      day: t.wed,
      dateNum: "12",
      month: t.aug,
      symptom: t.swelling,
      hasSupplement: true,
      foodSummary: "እንጀራ ከ ክክ ፍጥፍጥ ጋር +1",
    },
    {
      day: t.tue,
      dateNum: "11",
      month: t.aug,
      symptom: "No symptoms",
      hasSupplement: true,
      foodSummary: "ዳቦ ከ አቮካዶ ጋር +1",
    },
    {
      day: t.mon,
      dateNum: "10",
      month: t.aug,
      symptom: t.mildHeadache,
      hasSupplement: false,
      foodSummary: "እንጀራ ከ ምስር ጋር",
    },
    {
      day: t.sun,
      dateNum: "9",
      month: t.aug,
      symptom: t.fatigueFaceSwelling,
      hasSupplement: true,
      foodSummary: "እንጀራ ከ ቅቤ ጋር +1",
    },
    {
      day: t.sat,
      dateNum: "8",
      month: t.aug,
      symptom: "No symptoms",
      hasSupplement: true,
      foodSummary: "እንጀራ ከ አልጫ ወጥ ጋር",
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh">
      {/* Top Header */}
      <div className="relative pt-16 px-6 sm:px-7">
        <Header />
        <div className="mt-2">
          <h1 className="text-2xl font-extrabold text-brand-text">{t.historyTitle}</h1>
          <p className="text-xs text-brand-subtle font-medium mt-0.5">{t.historySub}</p>
        </div>
      </div>

      {/* History Cards List */}
      <main className="flex-1 px-6 sm:px-7 py-4 space-y-3 overflow-y-auto">
        {historyRecords.map((record, index) => (
          <div
            key={index}
            className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#CCC2B2] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              {/* Date Box */}
              <div className="w-12 h-14 rounded-2xl bg-[#EBE5DA] flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase font-bold text-brand-subtle tracking-wider">
                  {record.day}
                </span>
                <span className="text-base font-black text-brand-text leading-tight">
                  {record.dateNum}
                </span>
                <span className="text-[8px] uppercase font-semibold text-brand-subtle">
                  {record.month}
                </span>
              </div>

              {/* Check-in Content */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-brand-text">{record.symptom}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {record.hasSupplement && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D7EFE6] text-[#256349]">
                      {t.supplementBadge}
                    </span>
                  )}
                  <span className="text-xs text-brand-subtle">{record.foodSummary}</span>
                </div>
              </div>
            </div>

            {/* Chevron */}
            <svg
              className="w-4 h-4 text-brand-subtle stroke-current flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}