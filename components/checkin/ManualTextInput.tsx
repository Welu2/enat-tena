import { useState } from "react";
import { X } from "lucide-react";

interface ManualTextInputProps {
  language: string;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}

export function ManualTextInput({
  language,
  onClose,
  onSubmit,
}: ManualTextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onSubmit(text);
    setText("");
  };

  const title = language === "am" ? "በጽሑፍ ያስገቡ" : "Type your answer";
  const placeholder = language === "am"
    ? "የተሰማዎትን እዚህ ይጻፉ..."
    : "Describe what you experienced...";

  return (
    <div className="my-auto space-y-3 p-4 bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl animate-in fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
          {title}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-brand-subtle hover:text-brand-text cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full h-24 p-3 text-xs font-medium bg-white border border-[#D4C8B8] rounded-2xl focus:outline-hidden focus:border-brand-green resize-none"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="w-full py-2.5 rounded-xl bg-brand-green text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
      >
        {language === "am" ? "መዝግብ" : "Add Entry"}
      </button>
    </div>
  );
}