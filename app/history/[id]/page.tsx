"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { DetailSectionCard } from "@/components/history/DetailSectionCard";
import { DetailBulletItem } from "@/components/history/DetailBulletItem";

export default function CheckinDetailPage() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-16 pb-8 min-h-dvh select-none font-sans">
      {/* Top Header with Back Button and Language Switch */}
      <Header />

      <div className="flex-1 space-y-4 pt-2">
        {/* Title & Date */}
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text">
            {t.checkinDetailTitle}
          </h1>
          <p className="text-xs text-brand-subtle font-medium mt-0.5">
            {t.detailDateSample}
          </p>
        </div>

        {/* 1. Symptoms Card */}
        <DetailSectionCard
          title={t.symptomsSection}
          icon={
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        >
          <DetailBulletItem
            title={t.swellingLabel}
            subtitle={t.swellingDuration}
          />
        </DetailSectionCard>

        {/* 2. Food Card */}
        <DetailSectionCard
          title={t.foodSection}
          icon={
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          }
        >
          <DetailBulletItem
            title={t.injeraLentilsLunch}
            subtitle={t.injeraLentilsSub}
          />
          <DetailBulletItem
            title={t.fruitBreakfast}
            subtitle={t.fruitBreakfastSub}
          />
        </DetailSectionCard>

        {/* 3. Supplement Card */}
        <div className="bg-[#E4ECE7] border border-[#D0DFD6] p-4 rounded-3xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-brand-green text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-brand-text">
              {t.supplementSection}
            </h3>
            <p className="text-xs font-semibold text-brand-green mt-0.5">
              {t.takenStatus}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}