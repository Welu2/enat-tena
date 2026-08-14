"use client";

import { useLanguage } from "@/context/LanguageContext";

interface Props {
  isRecording: boolean;
  onToggleRecord: () => void;
}

export function VoiceMicButton({ isRecording, onToggleRecord }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center my-auto py-8">
      <button
        type="button"
        onClick={onToggleRecord}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
          isRecording
            ? "bg-red-600 animate-pulse text-white ring-8 ring-red-200"
            : "bg-brand-green hover:bg-brand-green-hover text-white"
        }`}
      >
        <svg className="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
          <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" />
        </svg>
      </button>

      <p className="font-bold text-sm text-brand-text mt-4">
        {isRecording ? t.listening : t.tapToSpeak}
      </p>
      <p className="text-xs text-brand-subtle mt-0.5">{t.audioNeverStored}</p>
    </div>
  );
}