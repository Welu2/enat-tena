"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { getOnboardingText } from "@/lib/translations/onboarding";
import { OnboardingState } from "./types";
import { StepProgress } from "./components/StepProgress";
import { StepDatingDemographics } from "./components/StepDatingDemographics";
import { StepObstetricHistory } from "./components/StepObstetricHistory";
import { StepMedicalHistory } from "./components/StepMedicalHistory";
import { StepSupplementsAndMic } from "./components/StepSupplementsAndMic";
import { userService } from "@/services/user.service";
import { apiClient } from "@/lib/api-client";
import { OnboardingPayload } from "@/types/api";
import { AlertCircle, CheckCircle2, Loader2, Volume2, VolumeX } from "lucide-react";

interface ToastNotification {
  type: "success" | "error";
  message: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isAm = lang === "am";
  const t = getOnboardingText(lang);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState<OnboardingState>({
    age: "",
    area: "urban",
    hospital: "",
    datingMethod: "lnmp",
    lnmpDate: "",
    manualWeeks: "",
    manualDays: "",
    ultrasoundDate: "",
    ultrasoundWeeks: "",
    calculatedStatus: null,
    totalPregnancies: "",
    liveBirths: "",
    hadCSection: false,
    childPassedAway: false,
    pastComplications: [],
    knownConditions: [],
    customMedicalCondition: "",
    malariaEndemicArea: false,
    currentMedications: "",
    takingSupplements: true,
    selectedSupplements: ["iron & folic acid", "calcium"],
    micState: "prompt",
  });

  const updateFormData = (fields: Partial<OnboardingState>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setIsPlayingAudio(false);
    setIsLoadingAudio(false);
  }, []);

  // Use Backend Addis AI TTS for native Amharic voice synthesis
  const triggerStepAudio = useCallback(
    (targetStep: 1 | 2 | 3 | 4) => {
      stopAudio();

      const promptText = t.audioPrompts[targetStep];
      if (!promptText) return;

      setIsLoadingAudio(true);

      // Stream MP3 directly from backend TTS endpoint
      const ttsUrl = apiClient.getFullUrl(`/tts?text=${encodeURIComponent(promptText)}`);
      const audio = new Audio(ttsUrl);
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setIsLoadingAudio(false);
        setIsPlayingAudio(true);
        audio.play().catch(() => {
          setIsPlayingAudio(false);
        });
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsLoadingAudio(false);
        setIsPlayingAudio(false);

        // Fallback to Web Speech API only if English
        if (!isAm && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(promptText);
          utterance.lang = "en-US";
          utterance.rate = 0.9;
          utterance.onstart = () => setIsPlayingAudio(true);
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.onerror = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utterance);
        }
      };
    },
    [t, isAm, stopAudio]
  );

  // Clean up audio on unmount or step changes
  useEffect(() => {
    return () => stopAudio();
  }, [step, stopAudio]);

  const handleNext = () => {
    stopAudio();
    setToast(null);

    if (step === 1) {
      if (!formData.age || Number(formData.age) < 12 || Number(formData.age) > 60) {
        setToast({ type: "error", message: t.validation.invalidAge });
        return;
      }
      if (formData.datingMethod === "lnmp" && !formData.lnmpDate) {
        setToast({ type: "error", message: t.validation.missingLnmpDate });
        return;
      }
      if (formData.datingMethod === "manual" && !formData.manualWeeks) {
        setToast({ type: "error", message: t.validation.missingManualWeeks });
        return;
      }
    }

    setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev));
  };

  const handleBack = () => {
    stopAudio();
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      router.push("/login");
    }
  };

  const finalizeOnboarding = async (micGranted: boolean) => {
    stopAudio();
    setIsSubmitting(true);
    setToast(null);

    try {
      const payload: OnboardingPayload = {
        age: Number(formData.age) || 24,
        area: formData.area,
        pregnancy_counting_method: formData.datingMethod,
        lnmp_date: formData.datingMethod === "lnmp" ? formData.lnmpDate : undefined,
        manual_gestational_weeks:
          formData.datingMethod === "manual" ? Number(formData.manualWeeks) : undefined,
        manual_gestational_days:
          formData.datingMethod === "manual" ? Number(formData.manualDays) || 0 : undefined,
        total_pregnancies: Number(formData.totalPregnancies) || 1,
        live_births: Number(formData.liveBirths) || 0,
        had_c_section: formData.hadCSection,
        child_passed_away: formData.childPassedAway,
        past_pregnancy_complications: formData.pastComplications,
        known_medical_conditions: formData.knownConditions,
        custom_medical_condition: formData.customMedicalCondition || undefined,
        malaria_endemic_area: formData.malariaEndemicArea,
        current_medications: formData.currentMedications || undefined,
        supplements: formData.takingSupplements ? formData.selectedSupplements : [],
        hospital: formData.hospital || undefined,
      };

      await userService.submitOnboarding(payload);

      if (typeof window !== "undefined") {
        localStorage.setItem("mic_permission", micGranted ? "granted" : "skipped");
      }

      setToast({ type: "success", message: t.toasts.success });
      setTimeout(() => router.replace("/home"), 700);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : "";
      setToast({
        type: "error",
        message: errorText || t.toasts.error,
      });
      setIsSubmitting(false);
    }
  };

  const requestMicAccess = async () => {
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        updateFormData({ micState: "granted" });
        await finalizeOnboarding(true);
      } else {
        await finalizeOnboarding(true);
      }
    } catch {
      updateFormData({ micState: "denied" });
      await finalizeOnboarding(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center">
      <main className="w-full max-w-md flex flex-col justify-between p-5 pb-7 font-sans select-none min-h-dvh">
        {toast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
            <div
              className={`p-4 rounded-2xl border shadow-lg flex items-center gap-3 backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-[#F0F7F3]/95 border-[#C8E1D3] text-[#2D6A4F]"
                  : "bg-[#FDF2F2]/95 border-[#F5C6C6] text-red-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={18} className="flex-shrink-0 text-[#2D6A4F]" />
              ) : (
                <AlertCircle size={18} className="flex-shrink-0 text-red-600" />
              )}
              <p className="text-xs font-semibold leading-snug">{toast.message}</p>
            </div>
          </div>
        )}

        <Header showBack={true} onBack={handleBack} />

        <div className="flex-1 flex flex-col justify-between mt-3 space-y-4">
          <div className="space-y-4">
            <StepProgress currentStep={step} />

            {/* Read Aloud Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => (isPlayingAudio ? stopAudio() : triggerStepAudio(step))}
                disabled={isLoadingAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isPlayingAudio
                    ? "bg-[#2D6A4F] text-white border-[#2D6A4F] animate-pulse"
                    : "bg-[#F4EFE6] text-[#2C2723] border-gray-200 hover:bg-neutral-100"
                }`}
              >
                {isLoadingAudio ? (
                  <Loader2 size={14} className="animate-spin text-[#2D6A4F]" />
                ) : isPlayingAudio ? (
                  <VolumeX size={14} />
                ) : (
                  <Volume2 size={14} className="text-[#2D6A4F]" />
                )}
                <span>
                  {isLoadingAudio
                    ? isAm ? "በማዘጋጀት ላይ..." : "Loading voice..."
                    : isPlayingAudio
                    ? t.voiceReader.stop
                    : t.voiceReader.readAloud}
                </span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs">
              {step === 1 && <StepDatingDemographics data={formData} updateData={updateFormData} />}
              {step === 2 && <StepObstetricHistory data={formData} updateData={updateFormData} />}
              {step === 3 && <StepMedicalHistory data={formData} updateData={updateFormData} />}
              {step === 4 && <StepSupplementsAndMic data={formData} updateData={updateFormData} />}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full min-h-[48px] py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white font-bold text-sm shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                {t.actions.continue}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={requestMicAccess}
                  className="w-full min-h-[48px] py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white font-bold text-sm shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t.actions.saving}</span>
                    </>
                  ) : (
                    <span>{t.actions.allowMic}</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => finalizeOnboarding(false)}
                  className="w-full min-h-[44px] py-2.5 rounded-2xl bg-[#E8E1D5] hover:bg-[#D8D0C3] text-[#2C2723] font-semibold text-xs active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                >
                  {t.actions.skipVoice}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}