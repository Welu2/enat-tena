import { VoiceMicButton } from "../../app/checkin/components/VoiceMicButton";
import { ManualTextInput } from "./ManualTextInput";
import { Loader2, Keyboard } from "lucide-react";

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
  onCompleteStage: () => Promise<void>;
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
  const loadingText = language === "am"
    ? "ድምጹን በመተርጎም እና በመመርመር ላይ..."
    : "Processing voice...";

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
              <span>{loadingText}</span>
            </div>
          )}
        </div>
      ) : (
        <ManualTextInput
          language={language}
          onClose={onHideManual}
          onSubmit={onManualSubmit}
        />
      )}

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