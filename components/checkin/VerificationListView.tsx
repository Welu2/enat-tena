import { PendingItem, CheckinStage } from "@/types/api";
import { PendingItemCard } from "./PendingItemCard";
import { Loader2 } from "lucide-react";

interface VerificationListViewProps {
  pendingItems: PendingItem[];
  transcript: string;
  stage: CheckinStage;
  currentStep: number;
  language: string;
  isProcessing: boolean;
  editingItemId: string | null;
  recordingTargetId: string | null;
  playingAudioKey: string | null;
  continueLabel: string;
  reRecordLabel: string;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string, severity: string) => Promise<void>;
  onToggleRecordItem: (id: string) => void;
  onToggleAudioItem: (item: PendingItem) => void;
  onToggleConfirmItem: (id: string) => void;
  onCompleteStage: () => Promise<void>;
  onResetItems: () => void;
}

export function VerificationListView({
  pendingItems,
  transcript,
  stage,
  currentStep,
  language,
  isProcessing,
  editingItemId,
  recordingTargetId,
  playingAudioKey,
  continueLabel,
  reRecordLabel,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleRecordItem,
  onToggleAudioItem,
  onToggleConfirmItem,
  onCompleteStage,
  onResetItems,
}: VerificationListViewProps) {
  const finishText = language === "am" ? "ምርመራውን አጠናቅቅ" : "Finish Check-in";

  return (
    <div className="flex-1 flex flex-col justify-between pt-6 animate-in fade-in duration-300">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-brand-text">
            {language === "am" ? "የተረዳነው መረጃ" : "What was captured"}
          </h3>
          <p className="text-xs text-brand-subtle">
            {language === "am"
              ? "እባክዎ የተረዳነውን ትክክለኛነት ያረጋግጡ ወይም ያስተካክሉ፦"
              : "Please verify or edit what was captured:"}
          </p>
        </div>

        {transcript && (
          <div className="p-3 bg-[#EAE4D9]/60 rounded-xl text-xs text-brand-subtle italic">
            &ldquo;{transcript}&rdquo;
          </div>
        )}

        <div className="space-y-3 pt-1">
          {pendingItems.map((item) => (
            <PendingItemCard
              key={item.item_id}
              item={item}
              stage={stage}
              language={language}
              isEditing={editingItemId === item.item_id}
              isRecording={recordingTargetId === item.item_id}
              isPlayingAudio={playingAudioKey === `item_${item.item_id}`}
              onStartEdit={() => onStartEdit(item.item_id)}
              onCancelEdit={onCancelEdit}
              onSaveEdit={(t, s) => onSaveEdit(item.item_id, t, s)}
              onToggleRecord={() => onToggleRecordItem(item.item_id)}
              onToggleAudio={() => onToggleAudioItem(item)}
              onToggleConfirm={() => onToggleConfirmItem(item.item_id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <button
          type="button"
          disabled={isProcessing}
          onClick={onCompleteStage}
          className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-base shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <span>{currentStep === 4 ? finishText : continueLabel}</span>
          )}
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={onResetItems}
          className="w-full min-h-[50px] py-4 rounded-2xl bg-brand-input border border-[#E4DCD0] hover:bg-[#EAE4D9] text-brand-text font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
        >
          {reRecordLabel}
        </button>
      </div>
    </div>
  );
}