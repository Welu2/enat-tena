import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  startVoiceCheckin,
  sendVoiceResponse,
  verifyCheckinItem,
  verifyCheckinItemsBulk,
  voiceCorrectCheckinItem,
  completeCheckinStage,
  checkAutomaticSummary,
} from "@/lib/api";
import { CheckinStage, PendingItem } from "@/types/api";
import {
  normalizeStage,
  getForcedNextStage,
} from "@/types/checkin";
import { CHECKIN_PROMPTS } from "@/utils/checkinPrompts";

export const STAGE_ORDER: CheckinStage[] = [
  "symptoms",
  "food",
  "supplement",
  "closing",
];

interface StageAdvancePayload {
  next_stage?: string | null;
  question_prompt?: string | null;
  question_audio_url?: string | null;
}

function triggerNextAudio(
  audioUrl: string | null | undefined,
  promptText: string | null | undefined,
  language: string,
  playTTS: (textOrUrl: string, key?: string) => Promise<void>
) {
  if (language !== "am") return;
  const target = audioUrl || promptText;
  if (target) playTTS(target, "question");
}

function buildBulkPayload(items: PendingItem[]) {
  return items.map((item) => ({
    item_id: item.item_id,
    confirmed: true,
    corrected_value: {
      raw_text: item.raw_text,
      ...(item.severity ? { severity: item.severity } : {}),
    },
  }));
}

export function useCheckinSession(
  language: string,
  playTTS: (textOrUrl: string, key?: string) => Promise<void>,
  stopTTS: () => void
) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<CheckinStage>("symptoms");
  const [promptAm, setPromptAm] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [dangerAlert, setDangerAlert] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasInitRef = useRef(false);

  const initSession = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return router.replace("/login");
    try {
      setIsStarting(true);
      setInitError(null);
      const data = await startVoiceCheckin();
      setSessionId(data.session_id);
      
      const initialStage = normalizeStage(data.stage);
      setStage(initialStage);
      
      const fallbackPrompt = CHECKIN_PROMPTS[initialStage]?.am || "";
      const promptToUse = data.question_prompt || fallbackPrompt;
      setPromptAm(promptToUse);

      const qAudio = (data as { question_audio_url?: string | null })
        .question_audio_url;
      setAudioUrl(qAudio || null);
      triggerNextAudio(qAudio, promptToUse, language, playTTS);
    } catch (err) {
      console.error("Session init failed:", err);
      setInitError(
        language === "am"
          ? "የምርመራ ክፍለ-ጊዜን መጀመር አልተቻለም።"
          : "Could not start check-in session."
      );
    } finally {
      setIsStarting(false);
    }
  }, [language, playTTS, router]);

  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;
    initSession();
    return () => stopTTS();
  }, [initSession, stopTTS]);

  const processVoice = async (blob: Blob) => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await sendVoiceResponse(sessionId, blob);
      const list = res.pending_items || [];
      setTranscript(res.transcript || "");
      setItems(list);
      if (list.length > 0 && language === "am") {
        const phrase =
          list[0].verification_phrase ||
          `${list[0].raw_text} — ትክክል ነው ወይ?`;
        playTTS(phrase, `item_${list[0].item_id}`);
      } else if (list.length === 0) {
        setErrorMsg(
          language === "am"
            ? "ምንም የተለየ ምልክት አልተገኘም።"
            : "No structured items detected."
        );
      }
    } catch (err) {
      console.error("Voice processing error:", err);
      setErrorMsg(
        language === "am"
          ? "ድምጹን ማስተናገድ አልተቻለም።"
          : "Voice recognition failed."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processCorrection = async (itemId: string, blob: Blob) => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await voiceCorrectCheckinItem(sessionId, itemId, blob);
      const updated = res.pending_items || [];
      setItems((prev) => {
        if (updated.length === prev.length) return updated;
        const uMap = new Map(updated.map((i) => [i.item_id, i]));
        return prev.map((item) => uMap.get(item.item_id) || item);
      });
      const newTx =
        (res as { correction_transcript?: string }).correction_transcript ||
        res.transcript;
      if (newTx) setTranscript(newTx);
      const item = updated.find((i) => i.item_id === itemId) || updated[0];
      if (item && language === "am") {
        const phrase =
          item.verification_phrase || `${item.raw_text} — ትክክል ነው ወይ?`;
        playTTS(phrase, `item_${item.item_id}`);
      }
    } catch (err) {
      console.error("Correction failed:", err);
      setErrorMsg(
        language === "am" ? "ማስተካከል አልተቻለም።" : "Correction failed."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const addManualItem = async (text: string) => {
    if (!text.trim() || !sessionId) return;
    const tempId = `item_${Date.now()}`;
    const cleanText = text.trim();
    const phrase = `${cleanText} — ትክክል ነው ወይ?`;
    try {
      await verifyCheckinItem(sessionId, tempId, true, cleanText);
    } catch (apiErr) {
      console.warn("Manual fallback error:", apiErr);
    }
    const newItem: PendingItem = {
      item_id: tempId,
      raw_text: cleanText,
      category: null,
      severity: "mild",
      danger_sign: false,
      confirmed: true,
      verification_phrase: phrase,
    };
    setItems((prev) => [...prev, newItem]);
    setErrorMsg(null);
    if (language === "am") playTTS(phrase, `item_${tempId}`);
  };

  const saveItemEdit = async (
    itemId: string,
    text: string,
    severity: string
  ) => {
    if (!sessionId) return;
    const phrase = `${text} — ትክክል ነው ወይ?`;
    try {
      await verifyCheckinItem(sessionId, itemId, true, text, severity);
      setItems((prev) =>
        prev.map((i) =>
          i.item_id === itemId
            ? {
                ...i,
                raw_text: text,
                severity,
                confirmed: true,
                verification_phrase: phrase,
                danger_sign: severity === "severe",
              }
            : i
        )
      );
      if (language === "am") playTTS(phrase, `item_${itemId}`);
    } catch (err) {
      console.error("Failed to save item edit:", err);
    }
  };

  const toggleConfirmItem = async (itemId: string) => {
    if (!sessionId) return;
    const target = items.find((i) => i.item_id === itemId);
    if (!target) return;
    const nextState = !target.confirmed;
    try {
      await verifyCheckinItem(sessionId, itemId, nextState);
      setItems((prev) =>
        prev.map((i) =>
          i.item_id === itemId ? { ...i, confirmed: nextState } : i
        )
      );
    } catch (err) {
      console.error("Verification toggle failed:", err);
    }
  };

  const advanceToNextStage = (
    next: CheckinStage,
    res: StageAdvancePayload
  ) => {
    setStage(next);
    const fallback = CHECKIN_PROMPTS[next]?.am || "";
    const promptToUse = res.question_prompt || fallback;
    setPromptAm(promptToUse);
    setItems([]);
    setTranscript("");
    setAudioUrl(res.question_audio_url || null);
    triggerNextAudio(
      res.question_audio_url,
      promptToUse,
      language,
      playTTS
    );
  };

  const completeStage = async () => {
    if (!sessionId) return;
    setIsProcessing(true);
    setErrorMsg(null);
    stopTTS();
    try {
      if (items.length > 0) {
        await verifyCheckinItemsBulk(sessionId, buildBulkPayload(items));
      }
      const res = await completeCheckinStage(sessionId);
      if (res.danger_sign_triggered) setDangerAlert(true);

      const nextTarget = getForcedNextStage(stage, res.next_stage);

      if (res.session_completed || (!res.next_stage && !nextTarget)) {
        checkAutomaticSummary().catch(() => null);
        router.push("/home");
      } else if (nextTarget) {
        advanceToNextStage(nextTarget, res);
      } else {
        router.push("/home");
      }
    } catch (err) {
      console.error("Stage completion error:", err);
      setErrorMsg(
        language === "am"
          ? "ደረጃውን ማጠናቀቅ አልተቻለም።"
          : "Failed to complete stage."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const previousStage = useCallback((): boolean => {
    stopTTS();
    setItems([]);
    setTranscript("");
    setErrorMsg(null);
    setDangerAlert(false);

    const currentIdx = STAGE_ORDER.indexOf(stage);
    if (currentIdx <= 0) {
      return false;
    }

    const prevStage = STAGE_ORDER[currentIdx - 1];
    const fallbackPrompt = CHECKIN_PROMPTS[prevStage]?.am || "";

    setStage(prevStage);
    setPromptAm(fallbackPrompt);
    setAudioUrl(null);

    if (language === "am" && fallbackPrompt) {
      playTTS(fallbackPrompt, "question");
    }

    return true;
  }, [stage, language, playTTS, stopTTS]);

  return {
    sessionId,
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
  };
}