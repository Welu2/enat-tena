import { useState, useRef, useCallback } from "react";
import { fetchTTSAudioBlobUrl } from "@/lib/api";

export function useTTSAudio(language: string) {
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const audioRequestIdRef = useRef<number>(0);

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

  const handleAudioCleanup = useCallback((reqId: number) => {
    if (audioRequestIdRef.current === reqId) {
      setPlayingAudioKey(null);
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    }
  }, []);

  const playTTS = useCallback(
    async (textOrUrl: string, audioKey: string = "question") => {
      if (!textOrUrl || language !== "am") return;
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
        audio.onended = () => handleAudioCleanup(currentRequestId);
        audio.onerror = () => handleAudioCleanup(currentRequestId);
        await audio.play();
      } catch {
        handleAudioCleanup(currentRequestId);
      }
    },
    [language, stopTTS, handleAudioCleanup]
  );

  return { playingAudioKey, playTTS, stopTTS };
}