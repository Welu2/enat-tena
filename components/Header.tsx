"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
    onBack?: () => void; // Optional custom back handler
}

export function Header({ onBack }: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { lang, setLang, t } = useLanguage();
    const isHome = pathname === "/";

    // Use custom handler if provided (for Onboarding), otherwise fall back to router.back()
    const handleBackAction = onBack ? onBack : () => router.back();

    return (
        <header className="absolute top-0 left-0 right-0 z-30 px-5 sm:px-6 pt-4 pb-2 flex items-center justify-between pointer-events-none">
            {!isHome ? (
                <button
                    type="button"
                    onClick={handleBackAction}
                    className="pointer-events-auto flex items-center gap-1.5 text-[#544D42] hover:text-brand-text font-medium text-sm transition-colors py-1.5 px-2 -ml-2 rounded-xl active:bg-black/5 focus:outline-none"
                >
                    <svg
                        className="w-4 h-4 stroke-current"
                        fill="none"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{t.back}</span>
                </button>
            ) : (
                <span className="text-xs font-semibold text-[#8C8273] tracking-tight">9:41</span>
            )}

            <div className="pointer-events-auto">
                <LanguageToggle currentLang={lang} onSelect={setLang} />
            </div>
        </header>
    );
}
