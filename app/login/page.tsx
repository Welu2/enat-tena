"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";
import { loginWithFastAPI, getUserProfile } from "@/lib/api";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface FormErrors {
  email?: string;
  password?: string;
}

interface ToastNotification {
  type: "success" | "error";
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlowResponse, setIsSlowResponse] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // =========================================================
  // Form Validation
  // =========================================================
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email =
        lang === "am" ? "እባክዎ ኢሜይልዎን ያስገቡ" : "Email address is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email =
        lang === "am"
          ? "እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ (ለምሳሌ sara@example.com)"
          : "Please enter a valid email address (e.g. sara@example.com)";
    }

    if (!password) {
      newErrors.password =
        lang === "am" ? "እባክዎ የይለፍ ቃልዎን ያስገቡ" : "Password is required";
    } else if (password.length < 6) {
      newErrors.password =
        lang === "am"
          ? "የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት"
          : "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // Backend Submission
  // =========================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!validateForm()) return;

    setIsLoading(true);
    setIsSlowResponse(false);

    // Warm-up timeout alert for sleeping Render instances
    const slowTimer = setTimeout(() => {
      setIsSlowResponse(true);
    }, 4000);

    try {
      // 1. Authenticate with FastAPI Backend (POST /auth/login)
      const authData = await loginWithFastAPI(email.trim().toLowerCase(), password);

      // 2. Persist session token and identifiers
      localStorage.setItem("access_token", authData.access_token);
      localStorage.setItem("user_id", authData.user_id);
      localStorage.setItem("user_email", authData.email);

      // 3. Pre-fetch profile to cache settings (Supplements, ANC Appointment)
      try {
        const profile = await getUserProfile();
        if (profile.appointment?.appointment_date) {
          localStorage.setItem("appointment_date", profile.appointment.appointment_date);
        }
      } catch {
        // Non-blocking fallback: continue even if profile pre-fetch is delayed
      }

      setToast({
        type: "success",
        message:
          lang === "am"
            ? "እንኳን ደህና መጡ! ወደ ዋናው ገጽ በማምራት ላይ..."
            : "Welcome back! Redirecting to dashboard...",
      });

      // Brief transition delay before routing
      setTimeout(() => {
        router.push("/home");
      }, 750);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : "";

      let userFriendlyMsg =
        lang === "am"
          ? "መግባት አልተሳካም። እባክዎ ኢሜይል እና የይለፍ ቃልዎን ያረጋግጡ።"
          : "Login failed. Please check your credentials.";

      if (
        errorText.toLowerCase().includes("invalid credentials") ||
        errorText.toLowerCase().includes("incorrect") ||
        errorText.toLowerCase().includes("unauthorized")
      ) {
        userFriendlyMsg =
          lang === "am"
            ? "የተሳሳተ ኢሜይል ወይም የይለፍ ቃል ነው።"
            : "Incorrect email or password.";
      }

      setToast({
        type: "error",
        message: userFriendlyMsg,
      });
    } finally {
      clearTimeout(slowTimer);
      setIsLoading(false);
      setIsSlowResponse(false);
    }
  };

  return (
    <main className="min-h-dvh w-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative select-none">
      {/* Floating In-App Toast Notification */}
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

      {/* Top Header / Language Switcher */}
      <div className="w-full max-w-md mx-auto flex justify-end">
        <Header />
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6 sm:py-8 sm:px-8 sm:bg-brand-card sm:rounded-3xl sm:shadow-xs sm:border sm:border-[#E4DCD0]/60">
        <div className="flex items-center gap-3.5 mb-6">
          <LogoBadge size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              {t.welcomeBack}
            </h2>
            <p className="text-xs sm:text-sm text-brand-subtle">
              {t.welcomeSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-brand-text">
              {lang === "am" ? "ኢሜይል" : "Email"}
            </label>
            <input
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="sara@example.com"
              className={`w-full min-h-[48px] px-4 py-3 sm:py-3.5 rounded-2xl bg-brand-input border text-brand-text placeholder-[#A3998C] text-sm focus:outline-none transition-all ${
                errors.email
                  ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                  : "border-[#E4DCD0] focus:ring-2 focus:ring-brand-green"
              }`}
            />
            {errors.email && (
              <p className="text-[11px] font-medium text-red-600 pl-1 flex items-center gap-1">
                <span>•</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-brand-text">
              {t.password}
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                disabled={isLoading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="••••••••"
                className={`w-full min-h-[48px] pl-4 pr-12 py-3 sm:py-3.5 rounded-2xl bg-brand-input border text-brand-text placeholder-[#A3998C] text-sm focus:outline-none transition-all ${
                  errors.password
                    ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                    : "border-[#E4DCD0] focus:ring-2 focus:ring-brand-green"
                }`}
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
            {errors.password && (
              <p className="text-[11px] font-medium text-red-600 pl-1 flex items-center gap-1">
                <span>•</span> {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[50px] mt-2 py-3.5 sm:py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm sm:text-base shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>
                  {isSlowResponse
                    ? lang === "am"
                      ? "አገልጋዩን በማገናኘት ላይ..."
                      : "Connecting to server..."
                    : lang === "am"
                    ? "በመግባት ላይ..."
                    : "Logging in..."}
                </span>
              </>
            ) : (
              t.logIn
            )}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="text-center mt-3">
          <Link
            href="/forgot-password"
            className="inline-block text-xs sm:text-sm font-medium text-brand-green hover:underline"
          >
            {t.forgotPassword}
          </Link>
        </div>
      </div>

      {/* Sign Up Redirect */}
      <div className="w-full max-w-md mx-auto text-center text-xs sm:text-sm text-brand-subtle py-4">
        {t.noAccount}{" "}
        <Link href="/signup" className="text-brand-green font-bold hover:underline ml-1">
          {t.signUp}
        </Link>
      </div>
    </main>
  );
}