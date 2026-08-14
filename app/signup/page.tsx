"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { LogoBadge } from "@/components/LogoBadge";
import { registerWithFastAPI } from "@/lib/api";
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const { lang, t } = useLanguage();

    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Added visibility state
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            //const data = await registerWithFastAPI(fullName, phoneNumber, password);
            //localStorage.setItem("access_token", data.access_token);
            alert(lang === "am" ? "አካውንትዎ በተሳካ ሁኔታ ተፈጥሯል!" : "Account created!");
            router.push("/onboarding");
        } catch (err: any) {
            setErrorMessage(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-20 pb-7 relative min-h-dvh">
            <Header />

            <div className="space-y-5 mt-2">
                <div className="flex items-center gap-3.5">
                    <LogoBadge size="md" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-brand-text">{t.createAccount}</h2>
                        <p className="text-xs sm:text-sm text-brand-subtle">{t.createSubtitle}</p>
                    </div>
                </div>

                {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                    <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-bold text-brand-text">
                            {t.fullName}
                        </label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={t.fullNamePlaceholder}
                            className="w-full min-h-[48px] px-4 py-3 sm:py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text placeholder-[#A3998C] text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                    </div>

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

                    <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-bold text-brand-text">
                            {t.password}
                        </label>
                        <div className="relative w-full">
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
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3998C] hover:text-brand-text transition-colors focus:outline-none"
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
                        {isLoading ? "..." : t.continue}
                    </button>
                </form>
            </div>

            <div className="text-center text-xs sm:text-sm text-brand-subtle pt-4">
                {t.haveAccount}{" "}
                <Link href="/login" className="text-brand-green font-bold hover:underline ml-1">
                    {t.logIn}
                </Link>
            </div>
        </main>
    );
}
