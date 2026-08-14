"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { HamburgerMenu } from "./HamBurgerMenu";

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean; // Added optional showBack override
  showMenu?: boolean; // Optional manual override
}

export function Header({ onBack, showBack, showMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [timeString, setTimeString] = useState<string>("");

  // Real-time clock update (mobile status bar style: H:MM)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTimeString(`${hours}:${minutes}`);
    };

    updateClock(); // Initial set
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  // Root landing and Home detection
  const isHome = pathname === "/home";
  const isLandingOrAuth =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding");

  // In-app routes (Hamburger only shows here on tablet/PC)
  const isAppRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/report") ||
    pathname.startsWith("/setting") ||
    pathname.startsWith("/checkin");

  // If showBack is explicitly passed, use it. Otherwise, hide on Home & Auth routes.
  const shouldShowBack = showBack !== undefined ? showBack : (!isHome && !isLandingOrAuth);
  const shouldShowHamburger = showMenu !== undefined ? showMenu : isAppRoute;

  const handleBackAction = onBack ? onBack : () => router.back();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-6 sm:px-7 pt-4 pb-2 flex items-center justify-between pointer-events-none">
      {/* Left side: Back Button or Clock */}
      <div className="pointer-events-auto flex items-center min-h-[32px]">
        {shouldShowBack ? (
          <button
            type="button"
            onClick={handleBackAction}
            className="flex items-center gap-1.5 text-[#544D42] hover:text-brand-text font-medium text-sm transition-colors py-1.5 px-2 -ml-2 rounded-xl active:bg-black/5 focus:outline-none cursor-pointer"
          >
            <svg
              className="w-4 h-4 stroke-current"
              fill="none"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t.back ?? "Back"}</span>
          </button>
        ) : (
          <span className="text-xs font-semibold text-[#8C8273] tracking-tight">
            {timeString || "--:--"}
          </span>
        )}
      </div>

      {/* Right side: Language Switcher + Conditional Hamburger */}
      <div className="pointer-events-auto flex items-center gap-2">
        <LanguageToggle currentLang={lang} onSelect={setLang} />

        {/* Hamburger ONLY renders after entering /home and in-app pages */}
        {shouldShowHamburger && <HamburgerMenu />}
      </div>
    </header>
  );
}