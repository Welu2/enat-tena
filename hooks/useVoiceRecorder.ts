import { useState, useRef, useCallback, useEffect } from "react";

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  mimeType: string;
  error: string | null;
}

const getOptimalMimeType = (): string => {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "audio/webm";
  }

  const supportedTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/wav",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  for (const type of supportedTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
};

export function useVoiceRecorder(
  maxDuration = 45,
  onAutoStop?: (blob: Blob) => void
): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeMimeType, setActiveMimeType] = useState<string>("audio/webm");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const selectedMimeTypeRef = useRef<string>("audio/webm");
  const onAutoStopRef = useRef(onAutoStop);

  useEffect(() => {
    onAutoStopRef.current = onAutoStop;
  }, [onAutoStop]);

  const startRecording = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const chosenMime = getOptimalMimeType();
      selectedMimeTypeRef.current = chosenMime;
      setActiveMimeType(chosenMime);

      const options: MediaRecorderOptions = chosenMime ? { mimeType: chosenMime } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const cleanType = selectedMimeTypeRef.current.split(";")[0] || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: cleanType });
        audioChunksRef.current = [];
        setIsRecording(false);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  // Trigger auto-upload to Addis AI when duration limit is reached
  useEffect(() => {
    if (isRecording && recordingTime >= maxDuration) {
      stopRecording().then((blob) => {
        if (blob && onAutoStopRef.current) {
          onAutoStopRef.current(blob);
        }
      });
    }
  }, [isRecording, recordingTime, maxDuration, stopRecording]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    mimeType: activeMimeType,
    error,
  };
}