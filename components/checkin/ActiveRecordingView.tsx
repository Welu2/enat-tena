"use client";

import { useState } from "react";
import { VoiceMicButton } from "@/app/checkin/components/VoiceMicButton";
import { Loader2, Keyboard, X } from "lucide-react";

interface ActiveRecordingViewProps {
  isRecording: boolean;
  isProcessing: boolean;
  showManualInput: boolean;
  language: string;
  skipLabel: string;
  onToggleRecord: () => void;
  onShowManual: () => void;
  onHideManual: () => void;
  onManualSubmit: (text: string) => Promise<void>;
  onCompleteStage: () => void;
}

export function ActiveRecordingView({
  isRecording,
  isProcessing,
  showManualInput,
  language,
  skipLabel,
  onToggleRecord,
  onShowManual,
  onHideManual,
  onManualSubmit,
  onCompleteStage,
}: ActiveRecordingViewProps) {
  const [manualText, setManualText] = useState("");

  const handleSubmit = async () => {
    if (!manualText.trim()) return;
    await onManualSubmit(manualText);
    setManualText("");
  };

  return (
    <div className="flex-1 flex flex-col justify-between pt-6">
      {!showManualInput ? (
        <div className="flex flex-col items-center justify-center my-auto">
          <VoiceMicButton
            isRecording={isRecording}
            onToggleRecord={onToggleRecord}
          />
          {isProcessing && (
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-brand-green">
              <Loader2 size={16} className="animate-spin" />
              <span>
                {language === "am"
                  ? "ድምጹን በመተርጎም እና በመመርመር ላይ..."
                  : "Analyzing clinical voice data..."}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="my-auto space-y-3 p-4 bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
              {language === "am" ? "በጽሑፍ ያስገቡ" : "Type your entry"}
            </h4>
            <button
              type="button"
              onClick={onHideManual}
              className="text-brand-subtle hover:text-brand-text cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={
              language === "am"
                ? "የተሰማዎትን ወይም የተመገቡትን እዚህ ይጻፉ..."
                : "Describe what you experienced or consumed..."
            }
            className="w-full h-24 p-3 text-xs font-medium bg-white border border-[#D4C8B8] rounded-2xl focus:outline-hidden focus:border-brand-green resize-none"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!manualText.trim()}
            className="w-full py-2.5 rounded-xl bg-brand-green text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            {language === "am" ? "መዝግብ" : "Add Entry"}
          </button>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="space-y-2 pt-4">
        {!showManualInput && (
          <button
            type="button"
            onClick={onShowManual}
            className="w-full min-h-[44px] py-2.5 rounded-2xl bg-white border border-[#E4DCD0] text-brand-text text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F5F0E8] transition-all cursor-pointer"
          >
            <Keyboard size={14} />
            <span>
              {language === "am" ? "በጽሑፍ መመለስ" : "Type instead of voice"}
            </span>
          </button>
        )}

        <button
          type="button"
          disabled={isProcessing || isRecording}
          onClick={onCompleteStage}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-brand-input border border-[#E4DCD0] hover:bg-[#EAE4D9] text-brand-subtle hover:text-brand-text text-xs font-semibold active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          {skipLabel}
        </button>
      </div>
    </div>
  );
}