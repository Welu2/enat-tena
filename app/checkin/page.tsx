"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

import { CheckinHeader } from "./components/CheckinHeader";
import { VoiceMicButton } from "./components/VoiceMicButton";
import { UnderstoodItem } from "./components/UnderstoodItem";

export default function CheckinWizardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  // Wizard Step: 1 = Symptoms, 2 = Food, 3 = Supplements, 4 = Other
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);

  // Toggle voice simulation
  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech processing delay
      setTimeout(() => {
        setIsRecording(false);
        setHasCaptured(true);
      }, 2000);
    } else {
      setIsRecording(false);
      setHasCaptured(true);
    }
  };

  const handleNextStep = () => {
    setHasCaptured(false);
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      // Step 4 Complete -> Route to Home Dashboard
      router.push("/home");
    }
  };

  const handleBack = () => {
    if (hasCaptured) {
      setHasCaptured(false);
    } else if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      router.push("/home");
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-4 pb-7 min-h-dvh select-none font-sans">
      {/* 4-Step Progress Header with Back Button */}
      <CheckinHeader currentStep={step} totalSteps={4} onBack={handleBack} />

      <div className="flex-1 flex flex-col justify-between pt-4">
        {/* Step Category & Question Title */}
        <div>
          <p className="text-[11px] font-bold tracking-wider text-brand-subtle uppercase">
            {step === 1 && t.symptomsCat}
            {step === 2 && t.foodCat}
            {step === 3 && t.supplementsCat}
            {step === 4 && t.otherCat}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-text mt-1 leading-snug">
            {step === 1 && t.symptomsQuestion}
            {step === 2 && t.foodQuestion}
            {step === 3 && t.supplementsCheckinQuestion}
            {step === 4 && t.otherQuestion}
          </h2>
        </div>

        {/* STATE A: ACTIVE VOICE RECORDING */}
        {!hasCaptured ? (
          <div className="flex-1 flex flex-col justify-between">
            <VoiceMicButton
              isRecording={isRecording}
              onToggleRecord={handleToggleRecord}
            />

            {/* Bottom Demo & Skip Controls */}
            <div className="space-y-2.5 pt-4">
              <button
                type="button"
                onClick={() => setHasCaptured(true)}
                className="w-full py-3 rounded-2xl bg-[#E2DBD0] hover:bg-[#D8D0C3] text-brand-subtle text-xs font-semibold active:scale-[0.99] transition-all cursor-pointer"
              >
                {t.toggleDangerDemo}
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full min-h-[48px] py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text text-xs sm:text-sm font-semibold active:scale-[0.99] transition-all cursor-pointer"
              >
                {t.skipNothing}
              </button>
            </div>
          </div>
        ) : (
          /* STATE B: UNDERSTOOD REVIEW & EDIT */
          <div className="flex-1 flex flex-col justify-between pt-6 animate-fadeIn">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-brand-text">
                  {t.whatWasUnderstood}
                </h3>
                <p className="text-xs text-brand-subtle">{t.confirmOrEdit}</p>
              </div>

              {/* Step 1 Items */}
              {step === 1 && (
                <div className="space-y-2 pt-1">
                  <UnderstoodItem title={t.swelling} subtitle={t.forTwoDays} />
                  <UnderstoodItem title={t.mildFatigue} />
                </div>
              )}

              {/* Step 2 Items */}
              {step === 2 && (
                <div className="space-y-2 pt-1">
                  <UnderstoodItem title="እንጀራ ከ ምስር ጋር" subtitle="Injera with lentils" />
                  <UnderstoodItem title="ፍራፍሬ (ሙዝ)" subtitle="Fruit (banana)" />
                  <UnderstoodItem title="ሩዝ ከ ወጥ ጋር" subtitle="Rice with stew" />
                </div>
              )}

              {/* Step 3 Items */}
              {step === 3 && (
                <div className="space-y-2 pt-1">
                  <UnderstoodItem
                    title={t.supplementTaken}
                    subtitle={lang === "am" ? "አይረን እና ፎሊክ አሲድ" : "Iron & Folic Acid"}
                  />
                </div>
              )}

              {/* Step 4 Items: Other */}
              {step === 4 && (
                <div className="space-y-2 pt-1">
                  <UnderstoodItem title={t.feelingGood} />
                </div>
              )}
            </div>

            {/* Action Buttons: Confirm / Re-record */}
            <div className="space-y-3 pt-6">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                {t.confirmAll}
              </button>
              <button
                type="button"
                onClick={() => setHasCaptured(false)}
                className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-input border border-[#E4DCD0] text-brand-text font-semibold text-base active:scale-[0.98] transition-all cursor-pointer"
              >
                {t.reRecord}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}