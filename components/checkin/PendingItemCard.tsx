import { PendingItem, CheckinStage } from "@/types/api";
import { ItemEditForm } from "./ItemEditForm";
import { Volume2, VolumeX, Mic, Edit2, CheckCircle2 } from "lucide-react";

interface PendingItemCardProps {
  item: PendingItem;
  stage: CheckinStage;
  language: string;
  isEditing: boolean;
  isRecording: boolean;
  isPlayingAudio: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (text: string, severity: string) => Promise<void>;
  onToggleRecord: () => void;
  onToggleAudio: () => void;
  onToggleConfirm: () => void;
}

export function PendingItemCard({
  item,
  stage,
  language,
  isEditing,
  isRecording,
  isPlayingAudio,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleRecord,
  onToggleAudio,
  onToggleConfirm,
}: PendingItemCardProps) {
  const verifyText =
    item.verification_phrase || `${item.raw_text} — ትክክል ነው ወይ?`;

  const containerBg = item.danger_sign
    ? "bg-red-50/80 border-red-200"
    : item.confirmed
    ? "bg-[#EBF5EF] border-[#B8DEC7]"
    : "bg-[#FAF7F2] border-[#E4DCD0]";

  if (isEditing) {
    return (
      <div className={`p-4 rounded-2xl border transition-all ${containerBg}`}>
        <ItemEditForm
          initialText={item.raw_text}
          initialSeverity={item.severity || "mild"}
          stage={stage}
          language={language}
          onCancel={onCancelEdit}
          onSave={onSaveEdit}
        />
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border transition-all ${containerBg}`}>
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          {language === "am" && (
            <button
              type="button"
              onClick={onToggleAudio}
              className={`p-2 rounded-xl flex-shrink-0 transition-colors cursor-pointer ${
                isPlayingAudio
                  ? "bg-brand-green text-white animate-pulse"
                  : "bg-[#EAE4D9] text-brand-text hover:bg-brand-green hover:text-white"
              }`}
            >
              {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
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

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
          <button
            type="button"
            onClick={onToggleRecord}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isRecording
                ? "bg-red-500 text-white border-red-600 animate-pulse"
                : "bg-white border-[#E4DCD0] text-brand-subtle hover:text-brand-text"
            }`}
          >
            <Mic size={13} />
            <span>
              {isRecording
                ? language === "am"
                  ? "እየቀዳ ነው..."
                  : "Recording..."
                : language === "am"
                ? "በድምፅ ቀይር"
                : "Voice"}
            </span>
          </button>

          <button
            type="button"
            onClick={onStartEdit}
            className="p-1.5 rounded-xl bg-white border border-[#E4DCD0] text-brand-subtle hover:text-brand-text cursor-pointer"
          >
            <Edit2 size={14} />
          </button>

          <button
            type="button"
            onClick={onToggleConfirm}
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
    </div>
  );
}