"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";

export default function SplashPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-dvh flex flex-col lg:grid lg:grid-cols-12 select-none relative bg-brand-card overflow-hidden">
      {/* Hero Media Section */}
      <div className="relative h-[45dvh] min-h-[300px] sm:min-h-[360px] lg:h-full lg:min-h-screen lg:col-span-6 xl:col-span-7 w-full overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8">
        <Image
          src="/enat.png"
          alt="Enat Tena Hero"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover object-top filter brightness-[0.7] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-3 max-w-md mx-auto">
          <LogoBadge size="lg" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {t.appName}
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#D4CBBF] font-semibold">
            {t.appSub}
          </p>
        </div>
      </div>

      {/* Action / Content Section */}
      <div className="flex-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-between bg-brand-card rounded-t-4xl lg:rounded-none -mt-6 lg:mt-0 px-6 sm:px-10 lg:px-12 xl:px-16 pt-8 lg:pt-10 pb-8 relative z-20 shadow-[-1px_-10px_30px_rgba(0,0,0,0.12)] lg:shadow-none">
        {/* Header positioned inside the action panel on desktop */}
        <div className="w-full">
          <Header />
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-6 lg:py-10 flex flex-col justify-center">
          <div className="text-center lg:text-left space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-brand-text leading-tight">
              {t.heroTitle}
            </h2>
            <p className="text-sm sm:text-base text-brand-subtle leading-relaxed font-normal">
              {t.heroDescription}
            </p>
          </div>

          <div className="space-y-3.5 my-6 sm:my-8">
            <Link
              href="/signup"
              className="w-full min-h-[52px] flex items-center justify-center py-3.5 sm:py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm sm:text-base shadow-sm active:scale-[0.99] transition-all"
            >
              {t.getStarted}
            </Link>
            <Link
              href="/login"
              className="w-full min-h-[52px] flex items-center justify-center py-3.5 sm:py-4 rounded-2xl bg-[#E2DBD0] hover:bg-[#D8D0C3] text-brand-text font-semibold text-sm sm:text-base active:scale-[0.99] transition-all"
            >
              {t.logIn}
            </Link>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-center lg:text-left text-brand-subtle tracking-wide max-w-md mx-auto lg:mx-0 w-full">
          {t.partnerFooter}
        </p>
      </div>
    </main>
  );
}