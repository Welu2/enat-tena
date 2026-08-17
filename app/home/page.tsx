"use client";

import { useLanguage } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { useDashboardData } from "@/hooks/useDashboardData";
import { HomeGreeting } from "@/components/home/HomeGreeting";
import { VoiceCheckinCTA } from "@/components/home/VoiceCheckinCTA";
import { AppointmentCard } from "@/components/home/AppointmentCard";
import {
  SupplementTrackerCard,
} from "@/components/home/SupplementTrackerCard";
import {
  RecentCheckinsSection,
} from "@/components/home/RecentCheckinsSection";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { t, lang } = useLanguage();
  const {
    isLoadingAuth,
    userName,
    daysAway,
    currentSupplementName,
    isAllDone,
    isToggling,
    completedCount,
    totalCount,
    recentDays,
    handleMarkNextSupplement,
  } = useDashboardData(lang);

  if (isLoadingAuth) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin mb-3" />
        <p className="text-xs font-semibold text-brand-subtle">
          {lang === "am" ? "በመጫን ላይ..." : "Loading dashboard..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8 font-sans select-none">
      <HomeGreeting
        displayName={userName}
        greetingText={t.greeting}
        language={lang}
      />

      <main className="flex-1 px-6 sm:px-7 py-4 space-y-4 overflow-y-auto">
        <VoiceCheckinCTA
          title={t.startTodayCheckin}
          subtitle={t.checkinSub}
        />

        <div className="grid grid-cols-2 gap-3">
          <AppointmentCard
            label={t.nextAppt}
            daysAwayText={t.daysAway}
            notSetText={lang === "am" ? "ቀጠሮ አልተያዘም" : "Not set"}
            daysAway={daysAway}
          />
          <SupplementTrackerCard
            currentSupplementName={currentSupplementName}
            isAllDone={isAllDone}
            isToggling={isToggling}
            completedCount={completedCount}
            totalCount={totalCount}
            doneText={t.done}
            markDoneText={t.markDone}
            onMarkNext={handleMarkNextSupplement}
          />
        </div>

        <RecentCheckinsSection
          title={t.recentCheckins}
          viewAllText={t.viewAll}
          emptyText={
            lang === "am"
              ? "እስካሁን ምንም የተመዘገበ የጤና ምርመራ የለም።"
              : "No check-ins recorded yet."
          }
          supplementBadge={t.supplementBadge}
          noSupplementText={
            lang === "am" ? "ተጨማሪ አልተወሰደም" : "No supplement"
          }
          recentDays={recentDays}
          language={lang}
        />
      </main>

      <BottomNav />
    </div>
  );
}