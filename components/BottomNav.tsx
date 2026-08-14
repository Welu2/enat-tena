"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const tabs = [
        {
            name: t.navHome,
            href: "/home",
            icon: (active: boolean) => (
                <svg className={`w-5 h-5 ${active ? "stroke-brand-green" : "stroke-[#8C8273]"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
                </svg>
            ),
        },
        {
            name: t.navHistory,
            href: "/history",
            icon: (active: boolean) => (
                <svg className={`w-5 h-5 ${active ? "stroke-brand-green" : "stroke-[#8C8273]"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                </svg>
            ),
        },
        {
            name: t.navReport,
            href: "/report",
            icon: (active: boolean) => (
                <svg className={`w-5 h-5 ${active ? "stroke-brand-green" : "stroke-[#8C8273]"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            name: t.navSettings,
            href: "/setting",
            icon: (active: boolean) => (
                <svg className={`w-5 h-5 ${active ? "stroke-brand-green" : "stroke-[#8C8273]"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
            ),
        },
    ];

    return (
        <nav className="w-full bg-[#EDE7DC] border-t border-[#E2DBD0] px-4 py-2 flex items-center justify-around z-30">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all"
                    >
                        {tab.icon(isActive)}
                        <span
                            className={`text-[11px] font-semibold ${isActive ? "text-brand-green font-bold" : "text-[#8C8273]"
                                }`}
                        >
                            {tab.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}