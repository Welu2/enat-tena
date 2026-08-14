"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";
import { registerWithFastAPI } from "@/lib/api";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  password?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // =========================================================
  // Validation Logic
  // =========================================================
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Full Name Validation
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName =
        lang === "am" ? "እባክዎ ሙሉ ስምዎን ያስገቡ" : "Full name is required";
    } else if (trimmedName.length < 2) {
      newErrors.fullName =
        lang === "am"
          ? "ስም ቢያንስ 2 ፊደላት መሆን አለበት"
          : "Full name must be at least 2 characters";
    }

    // 2. Ethiopian Phone Number Validation (09/07 or +2519/+2517 followed by 8 digits)
    const cleanedPhone = phoneNumber.replace(/\s+/g, "");
    const ethPhoneRegex = /^(\+251[79]\d{8}|0[79]\d{8}|[79]\d{8})$/;

    if (!cleanedPhone) {
      newErrors.phoneNumber =
        lang === "am" ? "እባክዎ ስልክ ቁጥርዎን ያስገቡ" : "Phone number is required";
    } else if (!ethPhoneRegex.test(cleanedPhone)) {
      newErrors.phoneNumber =
        lang === "am"
          ? "እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0912345678)"
          : "Enter a valid phone number (e.g., 0912345678 or +251912345678)";
    }

    // 3. Password Validation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Stop submission if form validation fails
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Backend integration
      // const data = await registerWithFastAPI(fullName.trim(), phoneNumber.trim(), password);
      // localStorage.setItem("access_token", data.access_token);

      alert(lang === "am" ? "አካውንትዎ በተሳካ ሁኔታ ተፈጥሯል!" : "Account created!");
      router.push("/onboarding");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          lang === "am"
            ? "ምዝገባው አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
            : "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh w-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative select-none">
      {/* Top Header / Language Switcher */}
      <div className="w-full max-w-md mx-auto flex justify-end">
        <Header />
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6 sm:py-8 sm:px-8 sm:bg-brand-card sm:rounded-3xl sm:shadow-xs sm:border sm:border-[#E4DCD0]/60">
        <div className="flex items-center gap-3.5 mb-6">
          <LogoBadge size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              {t.createAccount}
            </h2>
            <p className="text-xs sm:text-sm text-brand-subtle">
              {t.createSubtitle}
            </p>
          </div>
        </div>

        {/* Global Server Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-brand-text">
              {t.fullName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: undefined }));
                }
              }}
              placeholder={t.fullNamePlaceholder ?? "e.g. Sara Teka"}
              className={`w-full min-h-[48px] px-4 py-3 sm:py-3.5 rounded-2xl bg-brand-input border text-brand-text placeholder-[#A3998C] text-sm focus:outline-none transition-all ${
                errors.fullName
                  ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                  : "border-[#E4DCD0] focus:ring-2 focus:ring-brand-green"
              }`}
            />
            {errors.fullName && (
              <p className="text-[11px] font-medium text-red-600 pl-1 flex items-center gap-1">
                <span>•</span> {errors.fullName}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-brand-text">
              {t.phoneNumber}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) {
                  setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }
              }}
              placeholder={t.phoneNumberPlaceholder ?? "0912 345 678"}
              className={`w-full min-h-[48px] px-4 py-3 sm:py-3.5 rounded-2xl bg-brand-input border text-brand-text placeholder-[#A3998C] text-sm focus:outline-none transition-all ${
                errors.phoneNumber
                  ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                  : "border-[#E4DCD0] focus:ring-2 focus:ring-brand-green"
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-[11px] font-medium text-red-600 pl-1 flex items-center gap-1">
                <span>•</span> {errors.phoneNumber}
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
            className="w-full min-h-[50px] mt-2 py-3.5 sm:py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm sm:text-base shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "..." : t.continue}
          </button>
        </form>
      </div>

      {/* Bottom Redirect */}
      <div className="w-full max-w-md mx-auto text-center text-xs sm:text-sm text-brand-subtle py-4">
        {t.haveAccount}{" "}
        <Link href="/login" className="text-brand-green font-bold hover:underline ml-1">
          {t.logIn}
        </Link>
      </div>
    </main>
  );
}