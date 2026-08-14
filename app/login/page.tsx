"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";
import { loginWithFastAPI } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { lang, t } = useLanguage();

    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const data = await loginWithFastAPI(phoneNumber, password);
            localStorage.setItem("access_token", data.access_token);
            alert(lang === "am" ? "እንኳን ደህና መጡ!" : "Welcome back!");
            router.push("/home");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Login failed. Please check your credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-20 pb-7 relative min-h-dvh">
            <Header />

            <div className="space-y-6 mt-2">
                <div className="flex items-center gap-3.5">
                    <LogoBadge size="md" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
                            {t.welcomeBack}
                        </h2>
                        <p className="text-xs sm:text-sm text-brand-subtle">
                            {t.welcomeSubtitle}
                        </p>
                    </div>
                </div>

                {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl animate-shake">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Phone Number Field */}
                    <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-bold text-brand-text">
                            {t.phoneNumber}
                        </label>
                        <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder={t.phoneNumberPlaceholder}
                            className="w-full min-h-[48px] px-4 py-3 sm:py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text placeholder-[#A3998C] text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-bold text-brand-text">
                            {t.password}
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full min-h-[48px] pl-4 pr-12 py-3 sm:py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text placeholder-[#A3998C] text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3.5 p-1 text-[#A3998C] hover:text-brand-text transition-colors focus:outline-none flex items-center justify-center cursor-pointer z-10"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full min-h-[50px] mt-4 py-3.5 sm:py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm sm:text-base shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isLoading ? "..." : t.logIn}
                    </button>
                </form>

                <div className="text-center">
                    <Link
                        href="/forgot-password"
                        className="inline-block text-xs sm:text-sm font-medium text-brand-green hover:underline py-2"
                    >
                        {t.forgotPassword}
                    </Link>
                </div>
            </div>

            <div className="text-center text-xs sm:text-sm text-brand-subtle pt-4">
                {t.noAccount}{" "}
                <Link
                    href="/signup"
                    className="text-brand-green font-bold hover:underline ml-1"
                >
                    {t.signUp}
                </Link>
            </div>
        </main>
    );
}