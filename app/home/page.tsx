"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getUserProfile, getCheckinHistory } from "@/lib/api";
import { CheckinHistoryItem } from "@/types/api";
import { formatSyncedDate } from "@/lib/dateUtils";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userName, setUserName] = useState("ሳራ");
  const [daysAway, setDaysAway] = useState<number | null>(null);
  const [supplementName, setSupplementName] = useState<string | null>(null);
  const [supplementTaken, setSupplementTaken] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<CheckinHistoryItem[]>([]);

  // 1. Auth Guard & Initial Data Fetching
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const cachedName = localStorage.getItem("user_name");
    if (cachedName) {
      setUserName(cachedName);
    }

    async function loadDashboardData() {
      try {
        // Fetch profile settings (Appointment, Supplements)
        const profile = await getUserProfile();

        if (profile.appointment?.appointment_date) {
          const apptDate = new Date(profile.appointment.appointment_date);
          const todayDate = new Date();
          apptDate.setHours(0, 0, 0, 0);
          todayDate.setHours(0, 0, 0, 0);

          const diffMs = apptDate.getTime() - todayDate.getTime();
          const calculatedDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          setDaysAway(calculatedDays >= 0 ? calculatedDays : 0);
        }

        const activeSupp = profile.supplements?.find((s) => s.active);
        if (activeSupp) {
          setSupplementName(activeSupp.name);
        }

        // Fetch recent check-ins
        const history = await getCheckinHistory();
        setRecentCheckins(history.slice(0, 3));
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // Today's synced date
  const today = new Date();
  const formattedToday = formatSyncedDate(today, lang);

  // Authentication loading screen (prevents unauthenticated UI flash)
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
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8">
      {/* Top Header */}
      <div className="relative pt-16 md:pt-16 px-6 sm:px-7">
        <Header />

        {/* Greeting Banner */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xs text-brand-subtle font-medium transition-all">
              {formattedToday.full}
            </p>
            <h1 className="text-2xl font-extrabold text-brand-text">
              {t.greeting} <span className="font-bold">{userName}</span>
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E0EBE6] text-brand-green font-bold flex items-center justify-center text-sm shadow-xs uppercase">
            {userName.charAt(0) || (lang === "am" ? "ሳ" : "S")}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-6 sm:px-7 py-4 space-y-4 overflow-y-auto">
        {/* Start Today's Voice Check-in Hero CTA */}
        <Link
          href="/checkin"
          className="w-full bg-[#2E5243] hover:bg-brand-green text-white p-4.5 rounded-3xl flex items-center justify-between shadow-md active:scale-[0.99] transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{t.startTodayCheckin}</h3>
              <p className="text-xs text-white/75 mt-0.5">{t.checkinSub}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* 2-Column Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Next Appointment */}
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#E8EFEA] text-brand-green flex items-center justify-center">
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-brand-subtle font-medium">{t.nextAppt}</p>
              <p className="text-2xl font-black text-brand-green leading-none mt-0.5">
                {daysAway !== null ? daysAway : "--"}
              </p>
              <p className="text-[11px] text-brand-subtle mt-0.5">{t.daysAway}</p>
            </div>
          </div>

          {/* Card 2: Supplement Tracker */}
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex flex-col justify-between shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#EBE7DF] text-[#8C7A6B] flex items-center justify-center">
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="mt-2">
              <p className="text-[11px] text-brand-subtle font-medium truncate">
                {supplementName || t.takenToday}
              </p>
              <button
                type="button"
                onClick={() => setSupplementTaken((prev) => !prev)}
                className={`mt-1.5 w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  supplementTaken
                    ? "bg-[#DDEEE4] text-brand-green border border-brand-green/30"
                    : "bg-brand-green text-white hover:bg-brand-green-hover shadow-xs"
                }`}
              >
                {supplementTaken ? `✓ ${t.done}` : t.markDone}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Recent Check-ins */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-brand-text">{t.recentCheckins}</h4>
            <Link
              href="/history"
              className="text-xs text-brand-subtle hover:text-brand-text font-medium transition-colors"
            >
              {t.viewAll}
            </Link>
          </div>

          <div className="space-y-2">
            {recentCheckins.length > 0 ? (
              recentCheckins.map((item) => {
                const itemDate = formatSyncedDate(new Date(item.timestamp), lang);
                const titleText =
                  item.symptoms && item.symptoms.length > 0
                    ? item.symptoms.map((s) => s.raw_text).join(", ")
                    : lang === "am"
                    ? "ምንም ምልክት የለም"
                    : "No symptoms";

                const subText = item.supplement_check?.taken_today
                  ? t.supplementBadge
                  : lang === "am"
                  ? "ተጨማሪ አልተወሰደም"
                  : "No supplement";

                return (
                  <Link
                    key={item.id}
                    href={`/history/${item.id}`}
                    className="bg-[#FAF7F2] border border-[#E4DCD0] p-3.5 rounded-2xl flex items-center justify-between hover:border-[#CCC2B2] hover:bg-[#F5F0E8] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#EDE7DC] flex flex-col items-center justify-center text-center flex-shrink-0">
                        <span className="text-[9px] uppercase font-bold text-brand-subtle leading-tight">
                          {itemDate.month}
                        </span>
                        <span className="text-sm font-extrabold text-brand-text leading-tight">
                          {itemDate.dayNum}
                        </span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-brand-text group-hover:text-brand-green transition-colors line-clamp-1">
                          {titleText}
                        </h5>
                        <p className="text-[11px] text-brand-subtle">{subText}</p>
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-brand-subtle group-hover:text-brand-text group-hover:translate-x-0.5 transition-all stroke-current flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })
            ) : (
              <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-2xl text-center">
                <p className="text-xs text-brand-subtle">
                  {lang === "am"
                    ? "እስካሁን ምንም የተመዘገበ የጤና ምርመራ የለም።"
                    : "No check-ins recorded yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}