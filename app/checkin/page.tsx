"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { CheckinHeader } from "./components/CheckinHeader";
import { resolveActivePrompt, CHECKIN_PROMPTS } from "@/utils/checkinPrompts";
import { useTTSAudio } from "@/hooks/useTTSAudio";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useCheckinSession, STAGE_ORDER } from "@/hooks/useCheckinSession";
import {
  CheckinLoading,
  CheckinInitError,
} from "@/components/checkin/CheckinInitStates";
import { CheckinAlerts } from "@/components/checkin/CheckinAlerts";
import { CheckinStagePrompt } from "@/components/checkin/CheckinStagePrompt";
import { ActiveRecordingView } from "@/components/checkin/ActiveRecordingView";
import { VerificationListView } from "@/components/checkin/VerificationListView";
import { PendingItem } from "@/types/api";

const STAGE_STEP_MAP: Record<string, number> = {
  symptoms: 1,
  food: 2,
  supplement: 3,
  closing: 4,
  other: 4,
};

export default function CheckinWizardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { playingAudioKey, playTTS, stopTTS } = useTTSAudio(lang);

  const {
    stage,
    promptAm,
    audioUrl,
    items,
    transcript,
    dangerAlert,
    isStarting,
    isProcessing,
    initError,
    errorMsg,
    setItems,
    setTranscript,
    setErrorMsg,
    initSession,
    processVoice,
    processCorrection,
    addManualItem,
    saveItemEdit,
    toggleConfirmItem,
    completeStage,
    previousStage,
  } = useCheckinSession(lang, playTTS, stopTTS);

  const [showManual, setShowManual] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleAudioPayload = useCallback(
    async (blob: Blob, targetItemId?: string) => {
      if (targetItemId) {
        await processCorrection(targetItemId, blob);
      } else {
        await processVoice(blob);
      }
    },
    [processCorrection, processVoice]
  );

  const {
    isRecording,
    voiceCorrectingItemId,
    startRecording,
    stopRecording,
  } = useVoiceRecorder(handleAudioPayload, setErrorMsg, lang);

  const currentStep = STAGE_STEP_MAP[stage] || 1;

  const categoryLabel =
    lang === "am"
      ? CHECKIN_PROMPTS[stage]?.categoryAm || "ምርመራ"
      : CHECKIN_PROMPTS[stage]?.categoryEn || "CHECK-IN";

  const activePrompt = resolveActivePrompt(
    stage,
    lang,
    promptAm,
    t as unknown as Record<string, string>
  );

  const handleToggleQuestionAudio = () => {
    if (playingAudioKey === "question") {
      stopTTS();
    } else if (audioUrl) {
      playTTS(audioUrl, "question");
    } else if (promptAm) {
      playTTS(promptAm, "question");
    }
  };

  const handleToggleAudioItem = (item: PendingItem) => {
    if (playingAudioKey === `item_${item.item_id}`) {
      stopTTS();
    } else {
      const phrase =
        (item as { verification_audio_url?: string })
          .verification_audio_url ||
        item.verification_phrase ||
        `${item.raw_text} — ትክክል ነው ወይ?`;
      playTTS(phrase, `item_${item.item_id}`);
    }
  };

  const handleBack = () => {
    stopTTS();
    // 1. If user is in the verification list for current step, cancel back to recording view
    if (items.length > 0) {
      setItems([]);
      setTranscript("");
      return;
    }

    // 2. Go back to the previous question step. If on Question 1, return home.
    const movedToPrevious = previousStage();
    if (!movedToPrevious) {
      router.push("/home");
    }
  };

  if (initError) {
    return (
      <CheckinInitError
        message={initError}
        language={lang}
        onRetry={initSession}
      />
    );
  }

  if (isStarting) {
    return <CheckinLoading language={lang} />;
  }

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-4 pb-7 min-h-dvh select-none font-sans max-w-lg mx-auto w-full">
      <CheckinHeader
        currentStep={currentStep}
        totalSteps={STAGE_ORDER.length}
        onBack={handleBack}
      />

      <CheckinAlerts
        dangerAlert={Boolean(dangerAlert)}
        errorMessage={errorMsg}
        language={lang}
      />

      <div className="flex-1 flex flex-col justify-between pt-4">
        <CheckinStagePrompt
          categoryLabel={categoryLabel}
          activePrompt={activePrompt}
          language={lang}
          isPlayingAudio={playingAudioKey === "question"}
          onToggleAudio={handleToggleQuestionAudio}
        />

        {items.length === 0 ? (
          <ActiveRecordingView
            isRecording={isRecording}
            isProcessing={isProcessing}
            showManualInput={showManual}
            language={lang}
            skipLabel={
              t.skipNothing ||
              (lang === "am" ? "ምንም የለም / ዝለል" : "Nothing to report / Skip")
            }
            onToggleRecord={() =>
              isRecording ? stopRecording() : startRecording()
            }
            onShowManual={() => setShowManual(true)}
            onHideManual={() => setShowManual(false)}
            onManualSubmit={async (txt) => {
              await addManualItem(txt);
              setShowManual(false);
            }}
            onCompleteStage={completeStage}
          />
        ) : (
          <VerificationListView
            pendingItems={items}
            transcript={transcript}
            stage={stage}
            currentStep={currentStep}
            language={lang}
            isProcessing={isProcessing}
            editingItemId={editingItemId}
            recordingTargetId={voiceCorrectingItemId}
            playingAudioKey={playingAudioKey}
            continueLabel={t.continue || "Continue"}
            reRecordLabel={t.reRecord || "Re-record"}
            onStartEdit={(id) => setEditingItemId(id)}
            onCancelEdit={() => setEditingItemId(null)}
            onSaveEdit={async (id, txt, sev) => {
              await saveItemEdit(id, txt, sev);
              setEditingItemId(null);
            }}
            onToggleRecordItem={(id) =>
              isRecording && voiceCorrectingItemId === id
                ? stopRecording()
                : startRecording(id)
            }
            onToggleAudioItem={handleToggleAudioItem}
            onToggleConfirmItem={toggleConfirmItem}
            onCompleteStage={completeStage}
            onResetItems={() => {
              stopTTS();
              setItems([]);
              setTranscript("");
            }}
          />
        )}
      </div>
    </main>
  );
}