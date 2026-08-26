"use client";

import { useState } from "react";
import { PendingItem, CheckInStage } from "@/types/api";
import {
  Volume2,
  VolumeX,
  Mic,
  Edit2,
  CheckCircle2,
  Loader2,
  X,
  Check,
} from "lucide-react";

interface VerificationListViewProps {
  pendingItems: PendingItem[];
  transcript: string;
  stage: CheckInStage;
  currentStep: number;
  language: string;
  isProcessing: boolean;
  editingItemId: string | null;
  recordingTargetId: string | null;
  playingAudioKey: string | null;
  continueLabel: string;
  reRecordLabel: string;
  onStartEdit: (itemId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (itemId: string, text: string, severity?: string) => Promise<void>;
  onToggleRecordItem: (itemId: string) => void;
  onToggleAudioItem: (item: PendingItem) => void;
  onToggleConfirmItem: (itemId: string) => void;
  onCompleteStage: () => void;
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
  const [editText, setEditText] = useState("");
  const [editSeverity, setEditSeverity] = useState<string>("mild");

  const startEditMode = (item: PendingItem) => {
    setEditText(item.raw_text);
    setEditSeverity(item.severity || "mild");
    onStartEdit(item.item_id);
  };

  return (
    <div className="flex-1 flex flex-col justify-between pt-4 animate-in fade-in duration-300">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-brand-text">
            {language === "am" ? "የተመዘገቡ መረጃዎች" : "What was captured"}
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
          {pendingItems.map((item) => {
            const isEditing = editingItemId === item.item_id;
            const isItemRecording = recordingTargetId === item.item_id;
            const isAudioPlaying = playingAudioKey === `item_${item.item_id}`;
            const verifyText =
              item.verification_phrase || `${item.raw_text} — ትክክል ነው ወይ?`;

            return (
              <div
                key={item.item_id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.danger_sign
                    ? "bg-red-50/80 border-red-200"
                    : item.confirmed
                    ? "bg-[#EBF5EF] border-[#B8DEC7]"
                    : "bg-[#FAF7F2] border-[#E4DCD0]"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white border border-[#D4C8B8] rounded-xl focus:outline-hidden focus:border-brand-green"
                    />

                    {stage === "symptoms" && (
                      <div className="flex gap-1.5">
                        {(["mild", "moderate", "severe"] as const).map((sev) => (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => setEditSeverity(sev)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              editSeverity === sev
                                ? sev === "severe"
                                  ? "bg-red-600 text-white"
                                  : "bg-brand-green text-white"
                                : "bg-black/5 text-brand-subtle"
                            }`}
                          >
                            {sev}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="p-1.5 text-xs text-brand-subtle bg-white border border-[#E4DCD0] rounded-xl cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveEdit(item.item_id, editText, editSeverity)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-brand-green rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>{language === "am" ? "አስቀምጥ" : "Save"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 2-Row Card Structure: Sound icon is never covered */
                  <div className="space-y-3">
                    {/* Row 1: Audio speaker & Text */}
                    <div className="flex items-start gap-2.5">
                      {language === "am" && (
                        <button
                          type="button"
                          onClick={() => onToggleAudioItem(item)}
                          className={`p-2 rounded-xl flex-shrink-0 transition-colors cursor-pointer ${
                            isAudioPlaying
                              ? "bg-brand-green text-white animate-pulse"
                              : "bg-[#EAE4D9] text-brand-text hover:bg-brand-green hover:text-white"
                          }`}
                          title="ድምጹን አዳምጥ"
                        >
                          {isAudioPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
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

                    {/* Row 2: Action Controls */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                      <button
                        type="button"
                        onClick={() => onToggleRecordItem(item.item_id)}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isItemRecording
                            ? "bg-red-500 text-white border-red-600 animate-pulse"
                            : "bg-white border-[#E4DCD0] text-brand-subtle hover:text-brand-text"
                        }`}
                      >
                        <Mic size={13} />
                        <span>
                          {isItemRecording
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
                        onClick={() => startEditMode(item)}
                        className="p-1.5 rounded-xl bg-white border border-[#E4DCD0] text-brand-subtle hover:text-brand-text cursor-pointer"
                        title="Edit text"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleConfirmItem(item.item_id)}
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Actions */}
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
            <span>
              {currentStep === 4
                ? language === "am"
                  ? "ምርመራውን አጠናቅቅ"
                  : "Finish Check-in"
                : continueLabel}
            </span>
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