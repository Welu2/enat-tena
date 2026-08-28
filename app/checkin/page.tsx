"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { checkinService } from "@/services/checkin.service";
import { apiClient } from "@/lib/api-client";
import { CheckInStage, PendingItem, CompleteStageResponse } from "@/types/api";
import { CheckinDebugPanel, DebugLogEntry } from "@/components/CheckinDebugPanel";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Sparkles,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Plus,
  Radio,
} from "lucide-react";

const STAGE_ORDER: CheckInStage[] = ["symptoms", "food", "supplement", "closing"];

const STAGE_METADATA: Record<
  CheckInStage,
  {
    step: number;
    categoryAm: string;
    categoryEn: string;
  }
> = {
  symptoms: {
    step: 1,
    categoryAm: "የአደጋ ምልክቶች እና ህመም",
    categoryEn: "Danger Signs & Symptoms",
  },
  food: {
    step: 2,
    categoryAm: "የተመጣጠነ ምግብ እና አመጋገብ",
    categoryEn: "Maternal Nutrition & Diet",
  },
  supplement: {
    step: 3,
    categoryAm: "የቅድመ ወሊድ እንክብሎች (IFA)",
    categoryEn: "Daily Supplements (IFA)",
  },
  closing: {
    step: 4,
    categoryAm: "አጠቃላይ ስሜት እና ጥያቄዎች",
    categoryEn: "General Wellbeing & Questions",
  },
};

const STAGE_QUESTIONS: Record<CheckInStage, { am: string; en: string }> = {
  symptoms: {
    am: "ዛሬ ጽኑ ራስ ምታት፣ የዓይን ብዥታ፣ ደም መፍሰስ፣ ፈሳሽ መፍሰስ ወይም ከፍተኛ የሆድ ህመም ተሰምቶዎታል?",
    en: "Did you experience severe headache, blurred vision, vaginal bleeding, fluid leakage, or severe abdominal pain today?",
  },
  food: {
    am: "ዛሬ ምን አይነት ምግቦች ተመገቡ?",
    en: "What nutrient-dense foods or meals did you have today?",
  },
  supplement: {
    am: "የዛሬውን የብረት እና ፎሊክ አሲድ (IFA) ወይም የካልሲየም እንክብል ወስደዋል?",
    en: "Did you take your daily Iron & Folic Acid (IFA) or Calcium supplement today?",
  },
  closing: {
    am: "ሌላ የሚያስጨንቅዎት ማንኛውም የጤና ለውጥ፣ ህመም ወይም ጥያቄ አለዎት?",
    en: "Do you have any other symptoms, bodily changes, or questions for your healthcare provider?",
  },
};

export default function CheckinWizardPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isAm = lang === "am";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<CheckInStage>("symptoms");
  const [backendPrompt, setBackendPrompt] = useState<string>("");
  const [questionAudioUrl, setQuestionAudioUrl] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [transcript, setTranscript] = useState<string>("");

  const [isInitializing, setIsInitializing] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAdvancingStage, setIsAdvancingStage] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<CompleteStageResponse | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [voiceCorrectingItemId, setVoiceCorrectingItemId] = useState<string | null>(null);

  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState("");
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);

  const appendDebugLog = useCallback(
    (action: string, status: "pending" | "success" | "error", latencyMs?: number, payload?: unknown, response?: unknown) => {
      const entry: DebugLogEntry = {
        timestamp: new Date().toISOString().split("T")[1].slice(0, 8),
        action,
        status,
        latencyMs,
        payload,
        response,
      };
      setDebugLogs((prev) => [...prev.slice(-19), entry]);
    },
    []
  );

  const activePrompt = isAm
    ? backendPrompt || STAGE_QUESTIONS[currentStage]?.am || ""
    : STAGE_QUESTIONS[currentStage]?.en || backendPrompt || "";

  // Dedicated Audio Transmission to Addis AI
  const processVoiceResponse = useCallback(
    async (audioBlob: Blob) => {
      if (!audioBlob || !sessionId) return;

      setIsTranscribing(true);
      const startTime = Date.now();

      try {
        appendDebugLog(`POST /checkin/${sessionId}/respond`, "pending", undefined, {
          stage: currentStage,
          size: `${Math.round(audioBlob.size / 1024)} KB`,
        });

        const res = await checkinService.sendVoiceResponse(sessionId, audioBlob);
        const latency = Date.now() - startTime;

        setTranscript(res.transcript);
        setPendingItems(res.pending_items);

        appendDebugLog(`POST /checkin/${sessionId}/respond`, "success", latency, null, res);

        const firstItem = res.pending_items[0];
        if (isAm && firstItem?.verification_audio_url) {
          playAmharicBackendAudio(firstItem.verification_audio_url);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        appendDebugLog(`POST /checkin/${sessionId}/respond`, "error", Date.now() - startTime, null, {
          error: errorMsg,
        });
      } finally {
        setIsTranscribing(false);
      }
    },
    [sessionId, currentStage, isAm, appendDebugLog]
  );

  const processItemVoiceCorrection = useCallback(
    async (audioBlob: Blob, itemId: string) => {
      if (!audioBlob || !sessionId) return;

      setIsTranscribing(true);
      const startTime = Date.now();

      try {
        appendDebugLog(`POST /checkin/.../voice-correct`, "pending", undefined, { itemId });
        const res = await checkinService.voiceCorrectItem(sessionId, itemId, audioBlob);
        const latency = Date.now() - startTime;

        setPendingItems(res.pending_items);
        appendDebugLog(`POST /checkin/.../voice-correct`, "success", latency, null, res);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        appendDebugLog(`POST /checkin/.../voice-correct`, "error", Date.now() - startTime, null, {
          error: errorMsg,
        });
      } finally {
        setIsTranscribing(false);
        setVoiceCorrectingItemId(null);
      }
    },
    [sessionId, appendDebugLog]
  );

  // Hook receives callback to dispatch audio on 45s expiration
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder(45, (autoStoppedBlob) => {
    if (voiceCorrectingItemId) {
      processItemVoiceCorrection(autoStoppedBlob, voiceCorrectingItemId);
    } else {
      processVoiceResponse(autoStoppedBlob);
    }
  });

  const initializeSession = useCallback(async () => {
    setIsInitializing(true);
    const startTime = Date.now();

    try {
      appendDebugLog("POST /checkin/start", "pending");
      const res = await checkinService.startSession();
      const latency = Date.now() - startTime;

      setSessionId(res.session_id);
      setCurrentStage(res.stage);
      setBackendPrompt(res.question_prompt);
      setQuestionAudioUrl(res.question_audio_url);
      setPendingItems([]);
      setTranscript("");

      appendDebugLog("POST /checkin/start", "success", latency, null, res);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      appendDebugLog("POST /checkin/start", "error", Date.now() - startTime, null, { error: errorMsg });
    } finally {
      setIsInitializing(false);
    }
  }, [appendDebugLog]);

  useEffect(() => {
    initializeSession();
    return () => {
      stopAudioPlayback();
    };
  }, [initializeSession]);

  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setIsPlayingAudio(false);
  };

  const playAmharicBackendAudio = (url: string) => {
    stopAudioPlayback();
    const fullUrl = apiClient.getFullUrl(url);
    const audio = new Audio(fullUrl);
    audioPlayerRef.current = audio;

    audio.onplay = () => setIsPlayingAudio(true);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play().catch(() => setIsPlayingAudio(false));
  };

  const togglePromptAudio = () => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      return;
    }

    if (isAm) {
      if (questionAudioUrl) {
        playAmharicBackendAudio(questionAudioUrl);
      } else {
        const streamUrl = `/tts?text=${encodeURIComponent(activePrompt)}`;
        playAmharicBackendAudio(streamUrl);
      }
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activePrompt);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleToggleRecording = async () => {
    stopAudioPlayback();

    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        await processVoiceResponse(audioBlob);
      }
    } else {
      await startRecording();
    }
  };

  const handleToggleItemVoiceCorrection = async (itemId: string) => {
    stopAudioPlayback();

    if (voiceCorrectingItemId === itemId) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        await processItemVoiceCorrection(audioBlob, itemId);
      }
    } else {
      setVoiceCorrectingItemId(itemId);
      await startRecording();
    }
  };

  const handleToggleConfirm = (itemId: string) => {
    setPendingItems((prev) =>
      prev.map((it) => (it.item_id === itemId ? { ...it, confirmed: !it.confirmed } : it))
    );
  };

  const handleSaveTextEdit = (itemId: string) => {
    if (!editText.trim()) return;
    setPendingItems((prev) =>
      prev.map((it) =>
        it.item_id === itemId
          ? { ...it, raw_text: editText.trim(), confirmed: true }
          : it
      )
    );
    setEditingItemId(null);
    setEditText("");
  };

  const handleDeleteItem = (itemId: string) => {
    setPendingItems((prev) => prev.filter((it) => it.item_id !== itemId));
  };

  const handleAddManualTextItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    const newItem: PendingItem = {
      item_id: `manual_${Date.now()}`,
      raw_text: manualText.trim(),
      severity: "mild",
      danger_sign: false,
      confirmed: true,
      verification_phrase: `${manualText.trim()} — ${isAm ? "ትክክል ነው?" : "Is this correct?"}`,
    };

    setPendingItems((prev) => [...prev, newItem]);
    setManualText("");
    setShowManualInput(false);
  };

  const handleAdvanceStage = async () => {
    if (!sessionId) return;
    stopAudioPlayback();
    setIsAdvancingStage(true);
    const startTime = Date.now();

    try {
      if (pendingItems.length > 0) {
        const verifyPayload = {
          items: pendingItems.map((item) => ({
            item_id: item.item_id,
            confirmed: item.confirmed,
            corrected_value: {
              raw_text: item.raw_text,
              severity: item.severity,
            },
          })),
        };

        appendDebugLog(`POST /checkin/${sessionId}/verify`, "pending", undefined, verifyPayload);
        await checkinService.verifyItems(sessionId, verifyPayload);
        appendDebugLog(`POST /checkin/${sessionId}/verify`, "success");
      }

      appendDebugLog(`POST /checkin/${sessionId}/complete`, "pending");
      const completeRes = await checkinService.completeStage(sessionId);
      const latency = Date.now() - startTime;
      appendDebugLog(`POST /checkin/${sessionId}/complete`, "success", latency, null, completeRes);

      if (completeRes.session_completed) {
        setCompletionSummary(completeRes);
      } else if (completeRes.next_stage) {
        setCurrentStage(completeRes.next_stage);
        setBackendPrompt(completeRes.question_prompt || "");
        setQuestionAudioUrl(completeRes.question_audio_url || null);
        setPendingItems([]);
        setTranscript("");
        setShowManualInput(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      appendDebugLog(`POST /checkin/${sessionId}/complete`, "error", Date.now() - startTime, null, {
        error: errorMsg,
      });
    } finally {
      setIsAdvancingStage(false);
    }
  };

  const handleExit = () => {
    stopAudioPlayback();
    cancelRecording();
    router.push("/home");
  };

  const currentMetadata = STAGE_METADATA[currentStage] || {
    step: 1,
    categoryAm: "ምርመራ",
    categoryEn: "Intake",
  };

  const hasDangerSigns = pendingItems.some((i) => i.danger_sign);

  if (isInitializing) {
    return (
      <div className="min-h-dvh max-w-md mx-auto w-full flex flex-col justify-center items-center p-6 bg-[#FAF7F2] text-[#2C2723]">
        <Loader2 size={32} className="animate-spin text-[#2D6A4F] mb-3" />
        <p className="text-xs font-semibold text-[#7A7165]">
          {isAm ? "የድምፅ ፍተሻውን በማዘጋጀት ላይ..." : "Initializing voice session..."}
        </p>
      </div>
    );
  }

  if (completionSummary) {
    return (
      <div className="min-h-dvh max-w-md mx-auto w-full flex flex-col justify-between p-6 bg-[#FAF7F2] text-[#2C2723]">
        <div className="space-y-4 my-auto">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-[#1F2937]">
              {isAm ? "የዕለቱ ምርመራ ተጠናቋል!" : "Daily Check-in Completed!"}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {isAm
                ? "የተመዘገቡት መረጃዎች ለሀኪምዎ ሪፖርት ተቀምጠዋል"
                : "Your telemetry log is secured for your clinician summary"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider block">
              {isAm ? "የክሊኒካል ማጠቃለያ" : "Clinical Synthesis"}
            </span>
            <p className="text-xs text-[#374151] leading-relaxed font-medium">
              {isAm ? completionSummary.summary_text_am : completionSummary.summary_text_en}
            </p>

            {completionSummary.danger_sign_triggered && (
              <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span>
                  {isAm
                    ? "የአደጋ ምልክት ተመዝግቧል፣ በአስቸቋይ የህክምና እርዳታ ያግኙ"
                    : "Danger sign detected, please visit a healthcare facility immediately"}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/home")}
          className="w-full py-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer"
        >
          {isAm ? "ወደ ዋናው ገጽ ተመለስ" : "Back to Home Dashboard"}
        </button>

        <CheckinDebugPanel
          sessionId={sessionId}
          currentStage={currentStage}
          pendingItems={pendingItems}
          isRecording={isRecording}
          recordingTime={recordingTime}
          logs={debugLogs}
          onClearLogs={() => setDebugLogs([])}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center">
      <main className="w-full max-w-md flex flex-col justify-between p-5 pb-7 font-sans select-none min-h-dvh">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleExit}
              className="w-10 h-10 rounded-2xl bg-white border border-[#E8E1D5] flex items-center justify-center text-[#1F2937] hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center">
              <span className="text-[11px] font-bold tracking-widest text-[#2D6A4F] uppercase">
                {isAm
                  ? `ደረጃ ${currentMetadata.step} ከ 4`
                  : `Step ${currentMetadata.step} of 4`}
              </span>
              <p className="text-xs font-bold text-[#1F2937]">
                {isAm ? currentMetadata.categoryAm : currentMetadata.categoryEn}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExit}
              className="text-xs font-bold text-[#6B7280] hover:text-[#1F2937] px-2 py-1 cursor-pointer"
            >
              {isAm ? "ውጣ" : "Exit"}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {STAGE_ORDER.map((st, idx) => (
              <div
                key={st}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx < currentMetadata.step ? "bg-[#2D6A4F]" : "bg-[#E8E1D5]"
                }`}
              />
            ))}
          </div>
        </header>

        {hasDangerSigns && (
          <div className="mt-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">
                {isAm ? "አስቸኳይ የአደጋ ምልክት ተመዝግቧል!" : "Urgent Danger Sign Detected!"}
              </p>
              <p className="text-[11px] text-red-700 mt-0.5 leading-snug">
                {isAm
                  ? "እባክዎ በአቅራቢያዎ ወደሚገኝ ጤና ጣቢያ ወይም ሆስፒታል በአስቸቋይ ይሂዱ።"
                  : "Please visit your nearest health facility immediately for evaluation."}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] uppercase tracking-wider">
                {isAm ? currentMetadata.categoryAm : currentMetadata.categoryEn}
              </span>

              <button
                type="button"
                onClick={togglePromptAudio}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isPlayingAudio
                    ? "bg-[#2D6A4F] text-white animate-pulse"
                    : "bg-neutral-100 text-[#2D6A4F] hover:bg-neutral-200"
                }`}
                title="Speak prompt"
              >
                {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[#1F2937] leading-relaxed">
              {activePrompt}
            </h2>
          </div>

          {pendingItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center py-6">
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <div className="absolute w-28 h-28 rounded-full bg-[#2D6A4F]/20 animate-ping pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={isTranscribing}
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse"
                      : isTranscribing
                      ? "bg-amber-600 text-white"
                      : "bg-[#2D6A4F] hover:bg-[#1E4D38] text-white"
                  }`}
                  aria-label="Toggle voice recording"
                >
                  {isTranscribing ? (
                    <Loader2 size={36} className="animate-spin" />
                  ) : isRecording ? (
                    <MicOff size={36} />
                  ) : (
                    <Mic size={36} />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1F2937]">
                  {isTranscribing
                    ? isAm ? "በማዳመጥ እና በመተርጎም ላይ..." : "Transcribing with Addis AI..."
                    : isRecording
                    ? isAm ? `እያዳመጥኩ ነው... (${recordingTime}s/45s)` : `Listening... (${recordingTime}s/45s)`
                    : isAm ? "ድምፅዎን ለመቅረጽ ይጫኑ" : "Tap microphone to speak"}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {isAm ? "በአማርኛ በነጻነት ይናገሩ (እስከ 45 ሰከንድ)" : "Speak naturally in Amharic or English (max 45s)"}
                </p>
              </div>

              {showManualInput ? (
                <form onSubmit={handleAddManualTextItem} className="w-full space-y-2 animate-in fade-in">
                  <input
                    type="text"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={isAm ? "መልስዎን እዚህ ይጻፉ..." : "Type your response here..."}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8E1D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1F2937]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold hover:bg-[#1E4D38] cursor-pointer"
                    >
                      {isAm ? "አክል" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualInput(false)}
                      className="px-4 py-2.5 rounded-xl bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
                    >
                      {isAm ? "ሰርዝ" : "Cancel"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(true)}
                    className="text-xs font-semibold text-[#2D6A4F] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{isAm ? "በጽሁፍ አስገባ" : "Type manually"}</span>
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={handleAdvanceStage}
                    disabled={isAdvancingStage}
                    className="text-xs font-semibold text-[#6B7280] hover:text-[#1F2937] cursor-pointer"
                  >
                    {isAdvancingStage ? (
                      <Loader2 size={12} className="animate-spin inline mr-1" />
                    ) : null}
                    {isAm ? "ምንም የለም / ዝለል" : "Nothing to report / Skip"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#2D6A4F]" />
                    <span>{isAm ? "የተረጋገጡ መረጃዎች" : "Extracted Clinical Entities"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingItems([]);
                      setTranscript("");
                    }}
                    className="text-[11px] font-semibold text-[#6B7280] hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>{isAm ? "እንደገና ቅረጽ" : "Re-record"}</span>
                  </button>
                </div>

                {transcript && (
                  <div className="p-2.5 rounded-xl bg-[#F4EFE6] text-[#6B7280] text-[11px] italic">
                    &ldquo;{transcript}&rdquo;
                  </div>
                )}

                {pendingItems.map((item) => (
                  <div
                    key={item.item_id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      item.danger_sign
                        ? "bg-red-50/70 border-red-200"
                        : item.confirmed
                        ? "bg-white border-[#E8E1D5]"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    {editingItemId === item.item_id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#2D6A4F] text-xs focus:outline-none text-[#1F2937]"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveTextEdit(item.item_id)}
                            className="px-3 py-1.5 rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
                          >
                            {isAm ? "አስቀምጥ" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
                          >
                            {isAm ? "ሰርዝ" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleConfirm(item.item_id)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-colors cursor-pointer ${
                              item.confirmed
                                ? "bg-[#2D6A4F] text-white"
                                : "border-2 border-gray-300 bg-white"
                            }`}
                          >
                            {item.confirmed && <Check size={12} />}
                          </button>
                          <div>
                            <p
                              className={`text-xs font-bold leading-snug ${
                                item.confirmed ? "text-[#1F2937]" : "line-through text-gray-400"
                              }`}
                            >
                              {item.raw_text}
                            </p>
                            {item.verification_phrase && (
                              <p className="text-[11px] text-[#2D6A4F] font-semibold mt-0.5">
                                {item.verification_phrase}
                              </p>
                            )}
                            {item.danger_sign && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 mt-1 bg-red-100/60 px-2 py-0.5 rounded-full">
                                <AlertTriangle size={11} />
                                <span>{isAm ? "የአደጋ ምልክት" : "Danger Flag"}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleItemVoiceCorrection(item.item_id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              voiceCorrectingItemId === item.item_id
                                ? "bg-red-600 text-white animate-pulse"
                                : "text-gray-400 hover:text-[#2D6A4F] hover:bg-neutral-100"
                            }`}
                            title="Re-record voice for this item"
                          >
                            <Radio size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.item_id);
                              setEditText(item.raw_text);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-neutral-100 cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.item_id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={isAdvancingStage}
                onClick={handleAdvanceStage}
                className="w-full py-4 rounded-2xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white text-sm font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isAdvancingStage ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isAm ? "በማስቀመጥ ላይ..." : "Verifying & Saving..."}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStage === "closing"
                        ? isAm ? "ምርመራውን ጨርስ" : "Complete Check-in"
                        : isAm ? "አረጋግጥና ቀጥል" : "Verify & Continue"}
                    </span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      <CheckinDebugPanel
        sessionId={sessionId}
        currentStage={currentStage}
        pendingItems={pendingItems}
        isRecording={isRecording}
        recordingTime={recordingTime}
        logs={debugLogs}
        onClearLogs={() => setDebugLogs([])}
      />
    </div>
  );
}