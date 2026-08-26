"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";
import { authService } from "@/services/auth.service";
import { Loader2, CheckCircle2, ArrowLeft, Mail, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Forgot password error:", error);
      setErrorMessage(
        error.message ||
          (lang === "am"
            ? "የይለፍ ቃል መቀየሪያ መመሪያ መላክ አልተቻለም። እባክዎ ደግመው ይሞክሩ።"
            : "Failed to send reset email. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-20 pb-8 min-h-dvh max-w-lg mx-auto w-full select-none font-sans">
      <Header showBack={true} onBack={() => router.push("/login")} />

      <div className="space-y-6 mt-4">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <LogoBadge size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
              {t?.forgotPasswordTitle || (lang === "am" ? "የይለፍ ቃል ረስተዋል?" : "Forgot Password?")}
            </h2>
            <p className="text-xs sm:text-sm text-brand-subtle">
              {lang === "am"
                ? "የተመዘገቡበትን የኢሜይል አድራሻ ያስገቡ"
                : "Enter your registered email address"}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold leading-snug">{errorMessage}</span>
          </div>
        )}

        {!isSubmitted ? (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-brand-text">
                {t?.emailLabel || (lang === "am" ? "የኢሜይል አድራሻ" : "Email Address")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full min-h-[50px] pl-11 pr-4 py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text placeholder-[#A3998C] text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3998C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full min-h-[50px] mt-2 py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{lang === "am" ? "በመላክ ላይ..." : "Sending..."}</span>
                </>
              ) : (
                <span>
                  {t?.sendResetCode || (lang === "am" ? "መመሪያ ላክ" : "Send Reset Link")}
                </span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-xs sm:text-sm font-medium text-brand-subtle hover:text-brand-text cursor-pointer"
              >
                {t?.cancel || (lang === "am" ? "ተመለስ" : "Cancel")}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#E4DCD0] text-center space-y-4 shadow-xs animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#E2ECE6] text-brand-green flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={30} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-brand-text">
                {lang === "am" ? "መመሪያው ተልኳል!" : "Check Your Email"}
              </h3>
              <p className="text-xs text-brand-subtle leading-relaxed">
                {lang === "am" ? (
                  <>
                    የይለፍ ቃል መቀየሪያ መመሪያ ወደ{" "}
                    <strong className="text-brand-text font-semibold">{email}</strong>{" "}
                    ተልኳል።
                  </>
                ) : (
                  <>
                    We have sent password reset instructions to{" "}
                    <strong className="text-brand-text font-semibold">{email}</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full py-3.5 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>{lang === "am" ? "ወደ መግቢያ ገጽ ተመለስ" : "Back to Sign In"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setErrorMessage(null);
                }}
                className="w-full py-3 text-xs font-semibold text-brand-subtle hover:text-brand-text transition-colors cursor-pointer"
              >
                {lang === "am" ? "ኢሜይሉ አልደረሰዎትም? ደግመው ይሞክሩ" : "Didn't receive it? Try again"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div />
    </main>
  );
}