import { useState, useRef, useCallback } from "react";

function getSupportedMimeType(): string {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  return "audio/wav";
}

export function useVoiceRecorder(
  onAudioReady: (blob: Blob, targetItemId?: string) => Promise<void>,
  onError: (msg: string) => void,
  language: string
) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceCorrectingItemId, setVoiceCorrectingItemId] = useState<
    string | null
  >(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(
    async (targetItemId?: string) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        const mimeType = getSupportedMimeType();
        const recorder = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          stream.getTracks().forEach((track) => track.stop());
          if (blob.size > 500) {
            await onAudioReady(blob, targetItemId);
          } else {
            onError(
              language === "am"
                ? "የተቀዳ ድምፅ በጣም አጭር ነው። እባክዎ እንደገና ይናገሩ።"
                : "Recording too short. Speak clearly."
            );
          }
        };

        recorder.start(200);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        if (targetItemId) setVoiceCorrectingItemId(targetItemId);
      } catch (err) {
        console.error("Microphone access error:", err);
        onError(
          language === "am"
            ? "የማይክሮፎን ፈቃድ ማግኘት አልተቻለም።"
            : "Microphone permission denied."
        );
        setIsRecording(false);
        setVoiceCorrectingItemId(null);
      }
    },
    [language, onAudioReady, onError]
  );

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    voiceCorrectingItemId,
    setVoiceCorrectingItemId,
    startRecording,
    stopRecording,
  };
}