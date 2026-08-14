"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";


export default function HomePage() {
    const { t } = useLanguage();
    const [supplementTaken, setSupplementTaken] = useState(false);

    const checkins = [
        { date: "Aug 12", title: t.swelling, sub: t.supplementTaken },
        { date: "Aug 11", title: t.noSymptoms, sub: t.supplementTaken },
        { date: "Aug 10", title: t.mildHeadache, sub: t.noSupplement },
    ];

    return (
        <div className="flex-1 flex flex-col justify-between min-h-dvh">
            {/* Top Fixed Header with Date & User Avatar */}
            <div className="relative pt-16 px-6 sm:px-7">
                <Header />

                <div className="flex items-center justify-between mt-2">
                    <div>
                        <p className="text-xs text-brand-subtle font-medium">August 14, 2026</p>
                        <h1 className="text-2xl font-extrabold text-brand-text">
                            {t.greeting} <span className="font-bold">ሳራ</span>
                        </h1>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#E0EBE6] text-brand-green font-bold flex items-center justify-center text-sm shadow-sm">
                        ሳ
                    </div>
                </div>
            </div>

            {/* Main Scrollable Content */}
            <main className="flex-1 px-6 sm:px-7 py-4 space-y-4 overflow-y-auto">
                {/* Start Today's Check-in Hero CTA */}
                <Link
                    href="/checkin"
                    className="w-full bg-[#2E5243] hover:bg-brand-green text-white p-4.5 rounded-3xl flex items-center justify-between shadow-md active:scale-[0.99] transition-all group"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform">
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

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Card 1: Next Appointment */}
                    <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-2">
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
                            <p className="text-2xl font-black text-brand-green leading-none mt-0.5">21</p>
                            <p className="text-[11px] text-brand-subtle mt-0.5">{t.daysAway}</p>
                        </div>
                    </div>

                    {/* Card 2: Supplement Tracker */}
                    <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[#EBE7DF] text-[#8C7A6B] flex items-center justify-center">
                            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div className="mt-2">
                            <p className="text-[11px] text-brand-subtle font-medium">{t.takenToday}</p>
                            <button
                                type="button"
                                onClick={() => setSupplementTaken((prev) => !prev)}
                                className={`mt-1.5 w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${supplementTaken
                                    ? "bg-[#DDEEE4] text-brand-green border border-brand-green/30"
                                    : "bg-brand-green text-white hover:bg-brand-green-hover shadow-sm"
                                    }`}
                            >
                                {supplementTaken ? `✓ ${t.done}` : t.markDone}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Check-ins List */}
                <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-brand-text">{t.recentCheckins}</h4>
                        <button className="text-xs text-brand-subtle hover:text-brand-text font-medium">
                            {t.viewAll}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {checkins.map((item, index) => (
                            <div
                                key={index}
                                className="bg-[#FAF7F2] border border-[#E4DCD0] p-3.5 rounded-2xl flex items-center justify-between hover:border-[#CCC2B2] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-[#EDE7DC] flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] uppercase font-bold text-brand-subtle leading-tight">
                                            {item.date.split(" ")[0]}
                                        </span>
                                        <span className="text-sm font-extrabold text-brand-text leading-tight">
                                            {item.date.split(" ")[1]}
                                        </span>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-brand-text">{item.title}</h5>
                                        <p className="text-[11px] text-brand-subtle">{item.sub}</p>
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-brand-subtle stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}