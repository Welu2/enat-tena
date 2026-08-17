import { useState } from "react";
import { Check, X } from "lucide-react";
import { CheckinStage } from "@/types/api";

interface ItemEditFormProps {
  initialText: string;
  initialSeverity: string;
  stage: CheckinStage;
  language: string;
  onCancel: () => void;
  onSave: (text: string, severity: string) => Promise<void>;
}

export function ItemEditForm({
  initialText,
  initialSeverity,
  stage,
  language,
  onCancel,
  onSave,
}: ItemEditFormProps) {
  const [editText, setEditText] = useState(initialText);
  const [severity, setSeverity] = useState(initialSeverity || "mild");

  return (
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
              onClick={() => setSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                severity === sev
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
          onClick={onCancel}
          className="p-1.5 text-xs text-brand-subtle bg-white border border-[#E4DCD0] rounded-xl cursor-pointer"
        >
          <X size={14} />
        </button>
        <button
          type="button"
          onClick={() => onSave(editText, severity)}
          className="px-3 py-1.5 text-xs font-bold text-white bg-brand-green rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <Check size={14} />
          <span>{language === "am" ? "አስቀምጥ" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}