"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { HamburgerMenu } from "./HamBurgerMenu";

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  showMenu?: boolean;
}

export function Header({ onBack, showBack, showMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  // Root landing and Home detection
  const isHome = pathname === "/home";

  const isLandingOrAuth =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding");

  // In-app routes
  const isAppRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/report") ||
    pathname.startsWith("/setting") ||
    pathname.startsWith("/checkin");

  // Show back button on internal pages, unless explicitly overridden
  const shouldShowBack =
    showBack !== undefined
      ? showBack
      : !isHome && !isLandingOrAuth;

  const shouldShowHamburger =
    showMenu !== undefined ? showMenu : isAppRoute;

  const handleBackAction = onBack ?? (() => router.back());

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-6 sm:px-7 pt-4 pb-2 flex items-center justify-between pointer-events-none">
      
      {/* Left side: Back button only */}
      <div className="pointer-events-auto flex items-center min-h-[32px]">
        {shouldShowBack && (
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>

            <span>{t.back ?? "Back"}</span>
          </button>
        )}
      </div>

      {/* Right side: Language + Hamburger */}
      <div className="pointer-events-auto flex items-center gap-2">
        <LanguageToggle
          currentLang={lang}
          onSelect={setLang}
        />

        {shouldShowHamburger && <HamburgerMenu />}
      </div>
    </header>
  );
}
