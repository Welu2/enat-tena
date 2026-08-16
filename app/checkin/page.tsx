"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { CheckinHeader } from "./components/CheckinHeader";
import { VoiceMicButton } from "./components/VoiceMicButton";
import {
  startVoiceCheckin,
  sendVoiceResponse,
  verifyCheckinItem,
  verifyCheckinItemsBulk,
  voiceCorrectCheckinItem,
  completeCheckinStage,
  checkAutomaticSummary,
  fetchTTSAudioBlobUrl,
} from "@/lib/api";
import { PendingItem, CheckinStage } from "@/types/api";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Edit2,
  Check,
  X,
  Mic,
  Keyboard,
  RotateCw,
} from "lucide-react";

export default function CheckinWizardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  // Session & Stage State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<CheckinStage>("symptoms");
  const [questionPromptAm, setQuestionPromptAm] = useState<string>("");
  const [questionAudioUrl, setQuestionAudioUrl] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [dangerAlert, setDangerAlert] = useState<boolean>(false);

  // Recording & Processing State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(true);
  const [sessionInitError, setSessionInitError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Playback State & Lifecycle Tracking
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const audioRequestIdRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);

  // Manual Text Input Fallback
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState("");

  // Item Editing & Re-recording State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editSeverity, setEditSeverity] = useState<string>("mild");
  const [voiceCorrectingItemId, setVoiceCorrectingItemId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const stageStepMap: Record<CheckinStage, 1 | 2 | 3 | 4> = {
    symptoms: 1,
    food: 2,
    supplement: 3,
    closing: 4,
  };
  const currentStep = stageStepMap[stage] || 1;

  const activePrompt =
    lang === "en"
      ? stage === "symptoms"
        ? t.symptomsQuestion || "Please tell me the symptoms you have today."
        : stage === "food"
        ? t.foodQuestion || "What kinds of food did you eat today?"
        : stage === "supplement"
        ? t.supplementsCheckinQuestion || "Did you take your prescribed supplement today?"
        : t.otherQuestion || "Do you have any other questions or symptoms?"
      : questionPromptAm ||
        (stage === "symptoms" && t.symptomsQuestion) ||
        (stage === "food" && t.foodQuestion) ||
        (stage === "supplement" && t.supplementsCheckinQuestion) ||
        (stage === "closing" && t.otherQuestion);

  // Stop current TTS playback and invalidate in-flight fetches
  const stopTTS = useCallback(() => {
    audioRequestIdRef.current += 1;

    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
      ttsAudioRef.current = null;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setPlayingAudioKey(null);
  }, []);

  // Central Audio Playback Controller with Race-Condition Guard
  const playTTS = useCallback(
    async (textOrUrl: string, audioKey: string = "question") => {
      if (!textOrUrl || lang !== "am") return;

      stopTTS();
      const currentRequestId = ++audioRequestIdRef.current;

      try {
        setPlayingAudioKey(audioKey);
        const blobUrl = await fetchTTSAudioBlobUrl(textOrUrl);

        if (audioRequestIdRef.current !== currentRequestId || !blobUrl) {
          if (blobUrl) URL.revokeObjectURL(blobUrl);
          if (audioRequestIdRef.current === currentRequestId) {
            setPlayingAudioKey(null);
          }
          return;
        }

        activeBlobUrlRef.current = blobUrl;
        const audio = new Audio(blobUrl);
        ttsAudioRef.current = audio;

        audio.onended = () => {
          if (audioRequestIdRef.current === currentRequestId) {
            setPlayingAudioKey(null);
            if (activeBlobUrlRef.current) {
              URL.revokeObjectURL(activeBlobUrlRef.current);
              activeBlobUrlRef.current = null;
            }
          }
        };

        audio.onerror = () => {
          if (audioRequestIdRef.current === currentRequestId) {
            setPlayingAudioKey(null);
            if (activeBlobUrlRef.current) {
              URL.revokeObjectURL(activeBlobUrlRef.current);
              activeBlobUrlRef.current = null;
            }
          }
        };

        await audio.play();
      } catch {
        if (audioRequestIdRef.current === currentRequestId) {
          setPlayingAudioKey(null);
          if (activeBlobUrlRef.current) {
            URL.revokeObjectURL(activeBlobUrlRef.current);
            activeBlobUrlRef.current = null;
          }
        }
      }
    },
    [lang, stopTTS]
  );

  // Initialize Check-in Session
  const initSession = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setIsStartingSession(true);
      setSessionInitError(null);
      const data = await startVoiceCheckin();
      setSessionId(data.session_id);
      setStage(data.stage);
      setQuestionPromptAm(data.question_prompt);

      if ((data as any).question_audio_url && lang === "am") {
        setQuestionAudioUrl((data as any).question_audio_url);
        playTTS((data as any).question_audio_url, "question");
      } else if (data.question_prompt && lang === "am") {
        playTTS(data.question_prompt, "question");
      }
    } catch (err: unknown) {
      console.error("Failed to start checkin:", err);
      setSessionInitError(
        lang === "am"
          ? "የምርመራ ክፍለ-ጊዜን መጀመር አልተቻለም። ሰርቨሩ እየተነሳ ሊሆን ስለሚችል እባክዎ እንደገና ይሞክሩ።"
          : "Could not connect to the server. The backend may be waking up. Please tap retry."
      );
    } finally {
      setIsStartingSession(false);
    }
  }, [lang, playTTS, router]);

  // Strict-mode safe mounting effect
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    initSession();

    return () => {
      stopTTS();
    };
  }, [initSession, stopTTS]);

  // Microphone Capture Handlers
  const startRecording = async (targetItemId?: string) => {
    stopTTS();
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/wav";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        if (sessionId && audioBlob.size > 500) {
          if (targetItemId) {
            await processSingleItemVoiceCorrection(targetItemId, audioBlob);
          } else {
            await processVoiceUpload(audioBlob);
          }
        } else {
          setErrorMessage(
            lang === "am"
              ? "የተቀዳ ድምፅ በጣም አጭር ነው። እባክዎ ተጭነው እንደገና ይናገሩ።"
              : "Recording was too short. Please tap and speak clearly."
          );
        }
      };

      mediaRecorder.start(200);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      if (targetItemId) setVoiceCorrectingItemId(targetItemId);
    } catch (err) {
      console.error("Microphone error:", err);
      setErrorMessage(
        lang === "am"
          ? "የማይክሮፎን ፈቃድ ማግኘት አልተቻለም። እባክዎ በማስተካከያ ውስጥ ይፍቀዱ።"
          : "Microphone permission denied. Please allow microphone access."
      );
      setIsRecording(false);
      setVoiceCorrectingItemId(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecord = () => {
    if (isProcessing) return;
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Full-Stage Voice Upload
  const processVoiceUpload = async (audioBlob: Blob) => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await sendVoiceResponse(sessionId, audioBlob);
      const items = response.pending_items || [];
      setTranscript(response.transcript || "");
      setPendingItems(items);

      if (items.length > 0 && lang === "am") {
        const firstItem = items[0];
        const phraseToVoice =
          firstItem.verification_phrase ||
          `${firstItem.raw_text} — ትክክል ነው ወይ?`;

        playTTS(phraseToVoice, `item_${firstItem.item_id}`);
      } else if (items.length === 0) {
        setErrorMessage(
          lang === "am"
            ? "ምንም የተለየ ምልክት አልተገኘም። ደግመው ይናገሩ ወይም ከታች በጽሑፍ ያስገቡ።"
            : "No structured items detected. You can re-record, enter text below, or skip."
        );
      }
    } catch (err: unknown) {
      console.error("Voice processing failed:", err);
      setErrorMessage(
        lang === "am"
          ? "ድምጹን ማስተናገድ አልተቻለም። እባክዎ እንደገና ይሞክሩ ወይም በጽሑፍ ያስገቡ።"
          : "Voice recognition failed. Please try again or use text entry."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Single-Item Voice Correction
  const processSingleItemVoiceCorrection = async (itemId: string, audioBlob: Blob) => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await voiceCorrectCheckinItem(sessionId, itemId, audioBlob);
      const updatedItems = response.pending_items || [];

      setPendingItems((prev) => {
        if (updatedItems.length === prev.length) {
          return updatedItems;
        }
        const updatedMap = new Map(updatedItems.map((i) => [i.item_id, i]));
        return prev.map((item) => updatedMap.get(item.item_id) || item);
      });

      const newTranscript = (response as any).correction_transcript || response.transcript;
      if (newTranscript) {
        setTranscript(newTranscript);
      }

      const corrected = updatedItems.find((i) => i.item_id === itemId) || updatedItems[0];
      if (corrected && lang === "am") {
        const phraseToVoice =
          corrected.verification_phrase ||
          `${corrected.raw_text} — ትክክል ነው ወይ?`;

        playTTS(phraseToVoice, `item_${corrected.item_id}`);
      }
    } catch (err) {
      console.error("Single item correction failed:", err);
      setErrorMessage(
        lang === "am"
          ? "የተናገሩትን ማስተካከል አልተቻለም። እባክዎ በጽሑፍ ያስተካክሉ።"
          : "Re-recording failed. Please use text edit instead."
      );
    } finally {
      setIsProcessing(false);
      setVoiceCorrectingItemId(null);
    }
  };

  // Manual Text Submission
  const handleAddManualItem = async () => {
    if (!manualText.trim() || !sessionId) return;
    const tempId = `item_${Date.now()}`;
    const textVal = manualText.trim();
    const verifyPhrase = `${textVal} — ትክክል ነው ወይ?`;

    try {
      await verifyCheckinItem(sessionId, tempId, true, textVal);
    } catch (apiErr) {
      console.warn("Manual verify fallback:", apiErr);
    }

    const customItem: PendingItem = {
      item_id: tempId,
      raw_text: textVal,
      category: null,
      severity: "mild",
      danger_sign: false,
      confirmed: true,
      verification_phrase: verifyPhrase,
    };

    setPendingItems((prev) => [...prev, customItem]);
    setManualText("");
    setShowManualInput(false);
    setErrorMessage(null);

    if (lang === "am") {
      playTTS(verifyPhrase, `item_${tempId}`);
    }
  };

  // Save Item Text Edit
  const handleSaveItemEdit = async (itemId: string) => {
    if (!sessionId) return;
    const updatedPhrase = `${editText} — ትክክል ነው ወይ?`;

    try {
      await verifyCheckinItem(sessionId, itemId, true, editText, editSeverity);
      setPendingItems((prev) =>
        prev.map((i) =>
          i.item_id === itemId
            ? {
                ...i,
                raw_text: editText,
                severity: editSeverity,
                confirmed: true,
                verification_phrase: updatedPhrase,
                danger_sign: editSeverity === "severe",
              }
            : i
        )
      );
      setEditingItemId(null);

      if (lang === "am") {
        playTTS(updatedPhrase, `item_${itemId}`);
      }
    } catch (err) {
      console.error("Failed to save item edit:", err);
    }
  };

  // Toggle Confirmation
  const handleToggleConfirmItem = async (itemId: string) => {
    if (!sessionId) return;
    const target = pendingItems.find((i) => i.item_id === itemId);
    if (!target) return;

    const nextConfirmed = !target.confirmed;

    try {
      await verifyCheckinItem(sessionId, itemId, nextConfirmed);
      setPendingItems((prev) =>
        prev.map((i) => (i.item_id === itemId ? { ...i, confirmed: nextConfirmed } : i))
      );
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  // Complete Current Stage
  const handleCompleteStage = async () => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMessage(null);
    stopTTS();

    try {
      if (pendingItems.length > 0) {
        const bulkPayload = pendingItems.map((item) => ({
          item_id: item.item_id,
          confirmed: true,
          corrected_value: {
            raw_text: item.raw_text,
            ...(item.severity ? { severity: item.severity } : {}),
          },
        }));
        await verifyCheckinItemsBulk(sessionId, bulkPayload);
      }

      const result = await completeCheckinStage(sessionId);

      if (result.danger_sign_triggered) {
        setDangerAlert(true);
      }

      if (result.session_completed || !result.next_stage) {
        checkAutomaticSummary().catch(() => null);
        router.push("/home");
      } else {
        setStage(result.next_stage);
        setQuestionPromptAm(result.question_prompt || "");
        setPendingItems([]);
        setTranscript("");
        setShowManualInput(false);

        if (lang === "am") {
          const nextPrompt = (result as any).question_audio_url || result.question_prompt;
          if (nextPrompt) {
            setQuestionAudioUrl((result as any).question_audio_url || null);
            playTTS(nextPrompt, "question");
          }
        }
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

  const handleBack = () => {
    stopTTS();
    if (pendingItems.length > 0) {
      setPendingItems([]);
      setTranscript("");
    } else {
      router.push("/home");
    }
  };

  const hasCaptured = pendingItems.length > 0;

  // Render Initialization Failure View
  if (sessionInitError) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-[#FAF7F2] px-6 text-center max-w-md mx-auto">
        <div className="p-5 bg-red-50 border border-red-200 rounded-3xl space-y-3 w-full shadow-xs">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-xs font-semibold text-red-800 leading-relaxed">
            {sessionInitError}
          </p>
          <button
            type="button"
            onClick={() => {
              hasInitializedRef.current = false;
              initSession();
            }}
            className="w-full py-3 rounded-2xl bg-brand-green text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-all cursor-pointer shadow-xs"
          >
            <RotateCw size={14} />
            <span>{lang === "am" ? "እንደገና ይሞክሩ" : "Retry Connection"}</span>
          </button>
        </div>
      </main>
    );
  }

  // Render Initialization Loader
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
      <CheckinHeader currentStep={currentStep} totalSteps={4} onBack={handleBack} />

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

      {errorMessage && (
        <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
          {errorMessage}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between pt-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-wider text-brand-subtle uppercase">
              {stage === "symptoms" && (t.symptomsCat || "SYMPTOMS")}
              {stage === "food" && (t.foodCat || "FOOD")}
              {stage === "supplement" && (t.supplementsCat || "SUPPLEMENT")}
              {stage === "closing" && (t.otherCat || "CLOSING")}
            </p>

            {lang === "am" && (
              <button
                type="button"
                onClick={() => {
                  if (playingAudioKey === "question") {
                    stopTTS();
                  } else if (questionAudioUrl) {
                    playTTS(questionAudioUrl, "question");
                  } else if (questionPromptAm) {
                    playTTS(questionPromptAm, "question");
                  }
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  playingAudioKey === "question"
                    ? "bg-brand-green text-white animate-pulse"
                    : "bg-[#EAE4D9] text-brand-text hover:bg-brand-green hover:text-white"
                }`}
                title="Listen to question"
              >
                {playingAudioKey === "question" ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-brand-text mt-1 leading-snug">
            {activePrompt}
          </h2>
        </div>

        {/* STATE A: ACTIVE RECORDING */}
        {!hasCaptured ? (
          <div className="flex-1 flex flex-col justify-between pt-6">
            {!showManualInput ? (
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
                        : "Processing voice..."}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto space-y-3 p-4 bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                    {lang === "am" ? "በጽሑፍ ያስገቡ" : "Type your answer"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="text-brand-subtle hover:text-brand-text cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={
                    lang === "am"
                      ? "የተሰማዎትን እዚህ ይጻፉ..."
                      : "Describe what you experienced..."
                  }
                  className="w-full h-24 p-3 text-xs font-medium bg-white border border-[#D4C8B8] rounded-2xl focus:outline-hidden focus:border-brand-green resize-none"
                />
                <button
                  type="button"
                  onClick={handleAddManualItem}
                  disabled={!manualText.trim()}
                  className="w-full py-2.5 rounded-xl bg-brand-green text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {lang === "am" ? "መዝግብ" : "Add Entry"}
                </button>
              </div>
            )}

            <div className="space-y-2 pt-4">
              {!showManualInput && (
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="w-full min-h-[44px] py-2.5 rounded-2xl bg-white border border-[#E4DCD0] text-brand-text text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F5F0E8] transition-all cursor-pointer"
                >
                  <Keyboard size={14} />
                  <span>{lang === "am" ? "በጽሑፍ መመለስ" : "Type instead of voice"}</span>
                </button>
              )}

              <button
                type="button"
                disabled={isProcessing || isRecording}
                onClick={handleCompleteStage}
                className="w-full min-h-[44px] py-2.5 rounded-2xl bg-brand-input border border-[#E4DCD0] hover:bg-[#EAE4D9] text-brand-subtle hover:text-brand-text text-xs font-semibold active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {t.skipNothing || (lang === "am" ? "ምንም የለም / ዝለል" : "Nothing to report / Skip")}
              </button>
            </div>
          </div>
        ) : (
          /* STATE B: UNDERSTOOD ITEMS & VERIFICATION */
          <div className="flex-1 flex flex-col justify-between pt-6 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-brand-text">
                  {t.whatWasUnderstood || "What was captured"}
                </h3>
                <p className="text-xs text-brand-subtle">
                  {lang === "am"
                    ? "እባክዎ የተረዳነውን ትክክለኛነት ያረጋግጡ ወይም ያስተካክሉ፦"
                    : "Please verify or edit what was captured:"}
                </p>
              </div>

              {transcript && (
                <div className="p-3 bg-[#EAE4D9]/60 rounded-xl text-xs text-brand-subtle italic flex items-center justify-between">
                  <span>&ldquo;{transcript}&rdquo;</span>
                </div>
              )}

              <div className="space-y-3 pt-1">
                {pendingItems.map((item) => {
                  const isEditing = editingItemId === item.item_id;
                  const isItemRecording =
                    isRecording && voiceCorrectingItemId === item.item_id;
                  const isItemAudioPlaying = playingAudioKey === `item_${item.item_id}`;

                  const verifyText =
                    item.verification_phrase || `${item.raw_text} — ትክክል ነው ወይ?`;

                  return (
                    <div
                      key={item.item_id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.danger_sign
                          ? "bg-red-50/80 border-red-200"
                          : item.confirmed
                          ? "bg-[#EBF5EF] border-[#B8DEC7]"
                          : "bg-[#FAF7F2] border-[#E4DCD0]"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-[#D4C8B8] rounded-xl focus:outline-hidden focus:border-brand-green"
                          />

                          {stage === "symptoms" && (
                            <div className="flex gap-1.5">
                              {(["mild", "moderate", "severe"] as const).map((sev) => (
                                <button
                                  key={sev}
                                  type="button"
                                  onClick={() => setEditSeverity(sev)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                    editSeverity === sev
                                      ? sev === "severe"
                                        ? "bg-red-600 text-white"
                                        : "bg-brand-green text-white"
                                      : "bg-black/5 text-brand-subtle"
                                  }`}
                                >
                                  {sev}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="p-1.5 text-xs text-brand-subtle bg-white border border-[#E4DCD0] rounded-xl cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveItemEdit(item.item_id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-brand-green rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={14} />
                              <span>{lang === "am" ? "አስቀምጥ" : "Save"}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Row 1: Audio Speaker + Verification Text */}
                          <div className="flex items-start gap-2.5">
                            {lang === "am" && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (isItemAudioPlaying) {
                                    stopTTS();
                                  } else {
                                    playTTS(
                                      (item as any).verification_audio_url || verifyText,
                                      `item_${item.item_id}`
                                    );
                                  }
                                }}
                                className={`p-2 rounded-xl flex-shrink-0 transition-colors cursor-pointer ${
                                  isItemAudioPlaying
                                    ? "bg-brand-green text-white animate-pulse"
                                    : "bg-[#EAE4D9] text-brand-text hover:bg-brand-green hover:text-white"
                                }`}
                                title="ድምጹን አዳምጥ"
                              >
                                {isItemAudioPlaying ? (
                                  <VolumeX size={16} />
                                ) : (
                                  <Volume2 size={16} />
                                )}
                              </button>
                            )}

                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-sm font-bold text-brand-text leading-snug break-words">
                                {verifyText}
                              </p>

                              {item.severity &&
                                item.severity.toLowerCase() !== "mild" &&
                                item.severity.toLowerCase() !== "unspecified" && (
                                  <span
                                    className={`inline-block mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                      item.severity.toLowerCase() === "severe"
                                        ? "text-red-700 bg-red-100"
                                        : "text-amber-800 bg-amber-100"
                                    }`}
                                  >
                                    {item.severity}
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Row 2: Actions Bar */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                            {/* Re-record Item */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isItemRecording) stopRecording();
                                else startRecording(item.item_id);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isItemRecording
                                  ? "bg-red-500 text-white border-red-600 animate-pulse"
                                  : "bg-white border-[#E4DCD0] text-brand-subtle hover:text-brand-text"
                              }`}
                              title="Re-record item"
                            >
                              <Mic size={13} />
                              <span>
                                {isItemRecording
                                  ? lang === "am"
                                    ? "እየቀዳ ነው..."
                                    : "Recording..."
                                  : lang === "am"
                                  ? "በድምፅ ቀይር"
                                  : "Voice"}
                              </span>
                            </button>

                            {/* Edit Item Text */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemId(item.item_id);
                                setEditText(item.raw_text);
                                setEditSeverity(item.severity || "mild");
                              }}
                              className="p-1.5 rounded-xl bg-white border border-[#E4DCD0] text-brand-subtle hover:text-brand-text cursor-pointer"
                              title="Edit text"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Confirm Item Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleConfirmItem(item.item_id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                item.confirmed
                                  ? "bg-brand-green text-white"
                                  : "bg-[#E2DBD0] text-brand-text hover:bg-brand-green hover:text-white"
                              }`}
                            >
                              <CheckCircle2 size={14} />
                              <span>{item.confirmed ? "✓" : "Confirm"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advance Stage Actions */}
            <div className="space-y-3 pt-6">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompleteStage}
                className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <span>
                    {currentStep === 4
                      ? lang === "am"
                        ? "ምርመራውን አጠናቅቅ"
                        : "Finish Check-in"
                      : t.continue || "Continue"}
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  stopTTS();
                  setPendingItems([]);
                  setTranscript("");
                }}
                className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-input border border-[#E4DCD0] hover:bg-[#EAE4D9] text-brand-text font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                {t.reRecord || "Re-record"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}