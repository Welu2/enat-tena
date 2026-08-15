"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { CheckinHeader } from "./components/CheckinHeader";
import { VoiceMicButton } from "./components/VoiceMicButton";
import { UnderstoodItem } from "./components/UnderstoodItem";
import {
  startVoiceCheckin,
  sendVoiceResponse,
  verifyCheckinItem,
  completeCheckinStage,
} from "@/lib/api";
import { PendingItem, CheckinStage } from "@/types/api";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CheckinWizardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  // Session & Stage State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<CheckinStage>("symptoms");
  const [questionPrompt, setQuestionPrompt] = useState<string>("");
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [dangerAlert, setDangerAlert] = useState<boolean>(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Initialize Check-in Session (POST /checkin/start)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function initSession() {
      try {
        setIsStartingSession(true);
        const data = await startVoiceCheckin();
        setSessionId(data.session_id);
        setStage(data.stage);
        setQuestionPrompt(data.question_prompt);
      } catch (err: unknown) {
        console.error("Failed to start checkin:", err);
        setErrorMessage(
          lang === "am"
            ? "የምርመራ ክፍለ-ጊዜን መጀመር አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
            : "Failed to initialize check-in session. Please try again."
        );
      } finally {
        setIsStartingSession(false);
      }
    }

    initSession();
  }, [router, lang]);

  // Stage step mapping for CheckinHeader
  const stageStepMap: Record<CheckinStage, 1 | 2 | 3 | 4> = {
    symptoms: 1,
    food: 2,
    supplement: 3,
    closing: 4,
  };
  const currentStep = stageStepMap[stage] || 1;

  // 2. Start Microphone Audio Capture (.webm / .wav)
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000, // Optimal for Addis AI ASR
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Detect supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/wav";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        if (sessionId) {
          await processVoiceUpload(audioBlob);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setErrorMessage(
        lang === "am"
          ? "የማይክሮፎን ፈቃድ ማግኘት አልተቻለም። እባክዎ በማስተካከያ ውስጥ ይፍቀዱ።"
          : "Microphone permission denied. Please allow microphone access."
      );
      setIsRecording(false);
    }
  };

  // 3. Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Toggle voice recording
  const handleToggleRecord = () => {
    if (isProcessing) return;
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // 4. Send Audio to Backend (POST /checkin/{id}/respond)
  const processVoiceUpload = async (audioBlob: Blob) => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await sendVoiceResponse(sessionId, audioBlob);
      setTranscript(response.transcript || "");
      setPendingItems(response.pending_items || []);

      // If nothing was captured, directly prompt or allow retry
      if (!response.pending_items || response.pending_items.length === 0) {
        setErrorMessage(
          lang === "am"
            ? "ምንም ድምፅ አልተሰማም። እባክዎ ደግመው ይናገሩ ወይም 'ምንም አልተሰማኝም' የሚለውን ይጫኑ።"
            : "No items detected. Please re-record or proceed if you have nothing to report."
        );
      }
    } catch (err: unknown) {
      console.error("Voice processing failed:", err);
      setErrorMessage(
        lang === "am"
          ? "ድምጹን ማስተናገድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
          : "Voice recognition failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Confirm Individual Item Verification
  const handleConfirmItem = async (itemId: string, correctedText?: string) => {
    if (!sessionId) return;
    try {
      await verifyCheckinItem(sessionId, itemId, true, correctedText);
      setPendingItems((prev) =>
        prev.map((item) =>
          item.item_id === itemId
            ? { ...item, confirmed: true, raw_text: correctedText || item.raw_text }
            : item
        )
      );
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  // 6. Confirm All Items and Advance Stage (POST /checkin/{id}/complete)
  const handleCompleteStage = async () => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Auto-verify any unverified pending items first
      const unconfirmed = pendingItems.filter((i) => !i.confirmed);
      for (const item of unconfirmed) {
        await verifyCheckinItem(sessionId, item.item_id, true);
      }

      // Complete current stage & transition
      const result = await completeCheckinStage(sessionId);

      if (result.danger_sign_triggered) {
        setDangerAlert(true);
      }

      if (result.session_completed || !result.next_stage) {
        // Intake completed -> direct to dashboard
        router.push("/home");
      } else {
        // Move to next stage returned by backend
        setStage(result.next_stage);
        setQuestionPrompt(result.question_prompt || "");
        setPendingItems([]);
        setTranscript("");
      }
    } catch (err: unknown) {
      console.error("Stage completion error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : lang === "am"
          ? "ደረጃውን ማጠናቀቅ አልተቻለም።"
          : "Failed to complete stage."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Back Navigation
  const handleBack = () => {
    if (pendingItems.length > 0) {
      setPendingItems([]);
      setTranscript("");
    } else {
      router.push("/home");
    }
  };

  const hasCaptured = pendingItems.length > 0;

  // Session Initialization Loader
  if (isStartingSession) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#FAF7F2] gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-xs font-semibold text-brand-subtle">
          {lang === "am" ? "የምርመራ ክፍለ-ጊዜ በማዘጋጀት ላይ..." : "Starting check-in session..."}
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col justify-between px-6 sm:px-7 pt-4 pb-7 min-h-dvh select-none font-sans max-w-lg mx-auto w-full">
      {/* 4-Step Progress Header with Back Button */}
      <CheckinHeader currentStep={currentStep} totalSteps={4} onBack={handleBack} />

      {/* Clinical Danger Sign Alert Banner */}
      {dangerAlert && (
        <div className="mt-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2">
          <AlertTriangle size={20} className="flex-shrink-0 text-red-600" />
          <p>
            {lang === "am"
              ? "ማስጠንቀቂያ፦ አስቸኳይ የህክምና ክትትል የሚያስፈልግ ምልክት ተመዝግቧል።"
              : "Alert: A severe symptom requiring clinical attention was detected."}
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
          {errorMessage}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between pt-4">
        {/* Stage Category Label & Backend Dynamic Prompt */}
        <div>
          <p className="text-[11px] font-bold tracking-wider text-brand-subtle uppercase">
            {stage === "symptoms" && t.symptomsCat}
            {stage === "food" && t.foodCat}
            {stage === "supplement" && t.supplementsCat}
            {stage === "closing" && t.otherCat}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-text mt-1 leading-snug">
            {questionPrompt ||
              (stage === "symptoms" && t.symptomsQuestion) ||
              (stage === "food" && t.foodQuestion) ||
              (stage === "supplement" && t.supplementsCheckinQuestion) ||
              (stage === "closing" && t.otherQuestion)}
          </h2>
        </div>

        {/* STATE A: ACTIVE VOICE RECORDING */}
        {!hasCaptured ? (
          <div className="flex-1 flex flex-col justify-between pt-6">
            <div className="flex flex-col items-center justify-center my-auto">
              <VoiceMicButton
                isRecording={isRecording}
                onToggleRecord={handleToggleRecord}
              />
              {isProcessing && (
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-brand-green">
                  <Loader2 size={16} className="animate-spin" />
                  <span>
                    {lang === "am"
                      ? "ድምጹን በመተርጎም እና በመመርመር ላይ..."
                      : "Processing & transcribing voice..."}
                  </span>
                </div>
              )}
            </div>

            {/* Skip / "Nothing to report" Button */}
            <div className="space-y-2.5 pt-4">
              <button
                type="button"
                disabled={isProcessing || isRecording}
                onClick={handleCompleteStage}
                className="w-full min-h-[48px] py-3.5 rounded-2xl bg-brand-input border border-[#E4DCD0] hover:bg-[#EAE4D9] text-brand-text text-xs sm:text-sm font-semibold active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {t.skipNothing || (lang === "am" ? "ምንም የለም / ዝለል" : "Nothing / Skip")}
              </button>
            </div>
          </div>
        ) : (
          /* STATE B: UNDERSTOOD REVIEW & CONFIRMATION */
          <div className="flex-1 flex flex-col justify-between pt-6 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-brand-text">
                  {t.whatWasUnderstood}
                </h3>
                <p className="text-xs text-brand-subtle">
                  {lang === "am"
                    ? "እባክዎ የተረዳነውን ትክክለኛነት ያረጋግጡ፦"
                    : "Please verify what was captured:"}
                </p>
              </div>

              {/* Transcript read-back */}
              {transcript && (
                <div className="p-3 bg-[#EAE4D9]/60 rounded-xl text-xs text-brand-subtle italic">
                  &ldquo;{transcript}&rdquo;
                </div>
              )}

              {/* Dynamic Items from Backend */}
              <div className="space-y-2.5 pt-1">
                {pendingItems.map((item) => (
                  <div
                    key={item.item_id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.danger_sign
                        ? "bg-red-50/60 border-red-200"
                        : item.confirmed
                        ? "bg-[#EBF5EF] border-[#B8DEC7]"
                        : "bg-[#FAF7F2] border-[#E4DCD0]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-brand-text">
                          {item.verification_phrase || item.raw_text}
                        </p>
                        {item.severity && item.severity !== "mild" && (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded">
                            {item.severity}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleConfirmItem(item.item_id)}
                        className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          item.confirmed
                            ? "bg-brand-green text-white"
                            : "bg-[#E2DBD0] text-brand-text hover:bg-brand-green hover:text-white"
                        }`}
                      >
                        <CheckCircle2 size={16} />
                        <span>{item.confirmed ? "✓" : t.confirmAll ? "ያረጋግጡ" : "Confirm"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Advance / Re-record */}
            <div className="space-y-3 pt-6">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompleteStage}
                className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <span>
                    {currentStep === 4
                      ? lang === "am"
                        ? "ምርመራውን አጠናቅቅ"
                        : "Finish Check-in"
                      : t.confirmAll || "ቀጥል (Continue)"}
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setPendingItems([]);
                  setTranscript("");
                }}
                className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-input border border-[#E4DCD0] hover:bg-[#EAE4D9] text-brand-text font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
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