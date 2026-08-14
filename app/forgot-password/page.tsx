"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState("0912 345 678");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate FastAPI reset trigger
    setTimeout(() => {
      setIsLoading(false);
      alert("Reset code sent!");
      router.push("/login");
    }, 800);
  };

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-20 pb-8 min-h-dvh">
      <Header />

      <div className="space-y-6 mt-4">
        <div className="flex items-center gap-3.5">
          <LogoBadge size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text">{t.welcomeBack}</h2>
            <p className="text-xs sm:text-sm text-brand-subtle">{t.signInToContinue}</p>
          </div>
        </div>

        <form onSubmit={handleSendCode} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-brand-text">
              {t.phoneNumber}
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full min-h-[50px] px-4 py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text placeholder-[#A3998C] text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[50px] mt-2 py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? "..." : t.sendResetCode}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-xs sm:text-sm font-medium text-brand-subtle hover:text-brand-text cursor-pointer"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>

      <div />
    </main>
  );
}