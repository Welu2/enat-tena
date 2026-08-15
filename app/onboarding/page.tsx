"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { submitOnboardingData } from "@/lib/api";
import { StepProgress } from "./components/StepProgress";
import { StepSupplements } from "./components/StepSupplements";
import { StepAppointment } from "./components/StepAppointment";
import { StepMicrophone } from "./components/StepMicrophone";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface ToastNotification {
  type: "success" | "error";
  message: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Form State
  const [takingSupplements, setTakingSupplements] = useState(true);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>(["Iron"]);
  const [otherSupplement, setOtherSupplement] = useState("");
  const [hasAppointment, setHasAppointment] = useState(true);
  const [appointmentDate, setAppointmentDate] = useState("2026-09-04");
  const [micState, setMicState] = useState<"prompt" | "granted" | "denied">("prompt");

  // Ensure user is authenticated before allowing onboarding setup
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/signup");
    }
  }, [router]);

  const toggleSupplement = (item: string) => {
    setSelectedSupplements((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    } else {
      router.push("/signup");
    }
  };

  const finalizeOnboarding = async (micGranted: boolean) => {
    setIsSubmitting(true);
    setToast(null);

    try {
      // Build clean supplement list
      const supplementsToSave = takingSupplements
        ? [...selectedSupplements, otherSupplement.trim()].filter(Boolean)
        : [];

      // 1. Submit to FastAPI Backend (Supplements & ANC Appointment)
      await submitOnboardingData({
        supplements: supplementsToSave,
        appointmentDate: hasAppointment && appointmentDate ? appointmentDate : undefined,
        reminderLeadDays: 2,
      });

      // 2. Cache local preferences for dashboard access
      if (hasAppointment && appointmentDate) {
        localStorage.setItem("appointment_date", appointmentDate);
      }
      localStorage.setItem("mic_permission", micGranted ? "granted" : "skipped");

      setToast({
        type: "success",
        message:
          lang === "am"
            ? "ምዝገባው ተጠናቋል! ወደ መነሻ ገጽ በማምራት ላይ..."
            : "Setup complete! Redirecting to home...",
      });

      // Direct to dashboard
      setTimeout(() => {
        router.replace("/home");
      }, 700);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : lang === "am"
          ? "መረጃውን ማስቀመጥ አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
          : "Failed to save settings. Please try again.";

      setToast({
        type: "error",
        message: errorMsg,
      });
      setIsSubmitting(false);
    }
  };

  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop media tracks immediately after checking permission
      stream.getTracks().forEach((track) => track.stop());
      setMicState("granted");
      await finalizeOnboarding(true);
    } catch {
      setMicState("denied");
      await finalizeOnboarding(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-12 sm:pt-16 pb-7 relative min-h-dvh max-w-lg mx-auto w-full select-none">
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

      {/* Header with Step Back Handler */}
      <Header showBack={true} onBack={handleBack} />

      <div className="flex-1 flex flex-col justify-between mt-4">
        <div className="space-y-6">
          <StepProgress currentStep={step} />

          {step === 1 && (
            <StepSupplements
              takingSupplements={takingSupplements}
              setTakingSupplements={setTakingSupplements}
              selectedSupplements={selectedSupplements}
              toggleSupplement={toggleSupplement}
              otherSupplement={otherSupplement}
              setOtherSupplement={setOtherSupplement}
              onNoAnswer={handleNext}
            />
          )}

          {step === 2 && (
            <StepAppointment
              hasAppointment={hasAppointment}
              setHasAppointment={setHasAppointment}
              appointmentDate={appointmentDate}
              setAppointmentDate={setAppointmentDate}
              onNoAnswer={handleNext}
            />
          )}

          {step === 3 && <StepMicrophone micState={micState} />}
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-6">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full min-h-[50px] py-3.5 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              {t.continue}
            </button>
          ) : (
            <>
              {micState !== "denied" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={requestMicAccess}
                  className="w-full min-h-[50px] py-3.5 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{lang === "am" ? "በማስቀመጥ ላይ..." : "Saving..."}</span>
                    </>
                  ) : (
                    t.allowMic
                  )}
                </button>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => finalizeOnboarding(false)}
                className="w-full min-h-[50px] py-3.5 rounded-2xl bg-[#E2DBD0] hover:bg-[#D8D0C3] text-brand-text font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  t.skipForNow
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}