"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { submitOnboardingData } from "@/lib/api";
import { StepProgress } from "./components/StepProgress";
import { StepSupplements } from "./components/StepSupplements";
import { StepAppointment } from "./components/StepAppointment";
import { StepMicrophone } from "./components/StepMicrophone";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [takingSupplements, setTakingSupplements] = useState(true);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>(["Iron"]);
  const [otherSupplement, setOtherSupplement] = useState("");
  const [hasAppointment, setHasAppointment] = useState(true);
  const [appointmentDate, setAppointmentDate] = useState("2026-09-04");
  const [micState, setMicState] = useState<"prompt" | "granted" | "denied">("prompt");

  const toggleSupplement = (item: string) => {
    setSelectedSupplements((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleNext = () => setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
  
  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
    else router.push("/signup");
  };

  const finalizeOnboarding = async (micGranted: boolean) => {
    setIsSubmitting(true);
    try {
      const supplements = [...selectedSupplements];
      if (otherSupplement.trim()) supplements.push(otherSupplement.trim());

      await submitOnboardingData({
        taking_supplements: takingSupplements,
        supplements: takingSupplements ? supplements : [],
        appointment_date: hasAppointment ? appointmentDate : null,
        mic_permission_granted: micGranted,
      });
    } catch (err) {
      console.error("FastAPI Sync Error:", err);
    } finally {
      setIsSubmitting(false);
      // Redirects directly to home page after submission completes
      router.replace("/home"); 
    }
  };

  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicState("granted");
      await finalizeOnboarding(true);
    } catch {
      setMicState("denied");
      await finalizeOnboarding(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-20 pb-7 relative min-h-dvh">
     <Header 
  showBack={true} 
  onBack={handleBack} 
/>

      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-5">
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
              className="w-full min-h-[50px] py-3.5 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all"
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
                  className="w-full min-h-[50px] py-3.5 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {isSubmitting ? "..." : t.allowMic}
                </button>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => finalizeOnboarding(false)}
                className="w-full min-h-[50px] py-3.5 rounded-2xl bg-[#E2DBD0] hover:bg-[#D8D0C3] text-brand-text font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isSubmitting ? "..." : t.skipForNow}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
