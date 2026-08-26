"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";
import { loginWithFastAPI } from "@/lib/api";
import { userService } from "@/services/user.service";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setToast({
        type: "error",
        message:
          lang === "am"
            ? "እባክዎ ኢሜይል እና የይለፍ ቃልዎን ያስገቡ"
            : "Please enter your email and password",
      });
      return;
    }

    setIsLoading(true);

    try {
      await loginWithFastAPI(trimmedEmail, password);

      // Check if user completed onboarding questionnaire
      const profile = await userService.getProfile();

      setToast({
        type: "success",
        message:
          lang === "am"
            ? "በተሳካ ሁኔታ ገብተዋል! በማስተላለፍ ላይ..."
            : "Logged in successfully! Redirecting...",
      });

      setTimeout(() => {
        if (profile.onboarding_completed) {
          router.push("/home");
        } else {
          router.push("/onboarding");
        }
      }, 500);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : "";
      let userFriendlyMsg =
        lang === "am"
          ? "መግባት አልተሳካም። እባክዎ ኢሜይል ወይም የይለፍ ቃልዎን ያረጋግጡ።"
          : "Login failed. Please check your credentials and try again.";

      if (errorText.toLowerCase().includes("invalid")) {
        userFriendlyMsg =
          lang === "am"
            ? "የተሳሳተ ኢሜይል ወይም የይለፍ ቃል።"
            : "Invalid email or password.";
      }

      setToast({ type: "error", message: userFriendlyMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh w-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative select-none">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-lg flex items-center gap-3 backdrop-blur-md ${
              toast.type === "success"
                ? "bg-[#F0F7F3]/95 border-[#C8E1D3] text-brand-green"
                : "bg-[#FDF2F2]/95 border-[#F5C6C6] text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="flex-shrink-0 text-brand-green" />
            ) : (
              <AlertCircle size={18} className="flex-shrink-0 text-red-600" />
            )}
            <p className="text-xs font-semibold leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto flex justify-end">
        <Header />
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-6 sm:py-8 sm:px-8 sm:bg-brand-card sm:rounded-3xl sm:shadow-xs sm:border sm:border-[#E4DCD0]/60">
        <div className="flex items-center gap-3.5 mb-6">
          <LogoBadge size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              {t.logIn}
            </h2>
            <p className="text-xs sm:text-sm text-brand-subtle">
              {lang === "am"
                ? "የእናት ጤና መረጃዎን ለመከታተል ይግቡ"
                : "Log in to track your maternal health journey"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-brand-text">
              {lang === "am" ? "ኢሜይል" : "Email"}
            </label>
            <input
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sara@example.com"
              className="w-full min-h-[48px] px-4 py-3 sm:py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text placeholder-[#A3998C] text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs sm:text-sm font-bold text-brand-text">
                {t.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-subtle hover:text-brand-green transition-colors"
              >
                {lang === "am" ? "የይለፍ ቃል ረሱ?" : "Forgot password?"}
              </Link>
            </div>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[48px] pl-4 pr-12 py-3 sm:py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text placeholder-[#A3998C] text-sm focus:outline-none focus:ring-2 focus:ring-brand-green transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3998C] hover:text-brand-text transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[50px] mt-2 py-3.5 sm:py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm sm:text-base shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{lang === "am" ? "በማስኬድ ላይ..." : "Logging in..."}</span>
              </>
            ) : (
              t.logIn
            )}
          </button>
        </form>
      </div>

      <div className="w-full max-w-md mx-auto text-center text-xs sm:text-sm text-brand-subtle py-4">
        {lang === "am" ? "አካውንት የለዎትም?" : "Don't have an account?"}{" "}
        <Link href="/signup" className="text-brand-green font-bold hover:underline ml-1">
          {t.createAccount}
        </Link>
      </div>
    </main>
  );
}