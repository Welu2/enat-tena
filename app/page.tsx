"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";

export default function SplashPage() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col justify-between select-none relative min-h-dvh">
      <Header />

      {/* Hero Media Container with Dynamic Responsive Aspect Ratio */}
      <div className="relative h-[48dvh] min-h-[300px] sm:min-h-[340px] w-full overflow-hidden flex flex-col items-center justify-center pt-8">
        <Image
          src="/enat.png"
          alt="Enat Tena Hero"
          fill
          priority
          sizes="(max-width: 420px) 100vw, 420px"
          className="object-cover object-top filter brightness-[0.7] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-2 mt-4 px-4">
          <LogoBadge size="lg" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            {t.appName}
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#D4CBBF] font-semibold">
            {t.appSub}
          </p>
        </div>
      </div>

      {/* Bottom Action Sheet */}
      <div className="bg-brand-card rounded-t-4xl px-6 sm:px-7 pt-8 pb-7 shadow-[-1px_-10px_30px_rgba(0,0,0,0.12)] flex-1 flex flex-col justify-between -mt-6 relative z-20">
        <div className="text-center space-y-2.5 sm:space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-text leading-snug">
            {t.heroTitle}
          </h2>
          <p className="text-xs sm:text-sm text-brand-subtle leading-relaxed px-1 font-normal">
            {t.heroDescription}
          </p>
        </div>

        <div className="space-y-3 my-5 sm:my-6">
          <Link
            href="/signup"
            className="w-full min-h-[50px] flex items-center justify-center py-3.5 sm:py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm sm:text-base shadow-sm active:scale-[0.98] transition-all"
          >
            {t.getStarted}
          </Link>
          <Link
            href="/login"
            className="w-full min-h-[50px] flex items-center justify-center py-3.5 sm:py-4 rounded-2xl bg-[#E2DBD0] hover:bg-[#D8D0C3] text-brand-text font-semibold text-sm sm:text-base active:scale-[0.98] transition-all"
          >
            {t.logIn}
          </Link>
        </div>

        <p className="text-[10px] sm:text-xs text-center text-brand-subtle tracking-wide">
          {t.partnerFooter}
        </p>
      </div>
    </main>
  );
}