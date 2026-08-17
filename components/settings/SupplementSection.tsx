import { useState, KeyboardEvent } from "react";
import { Pill, Trash2, Loader2, Plus } from "lucide-react";
import { SupplementItem } from "@/types/api";

interface SupplementSectionProps {
  title: string;
  placeholderText: string;
  supplements: SupplementItem[];
  isSaving: boolean;
  onAdd: (name: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function SupplementSection({
  title,
  placeholderText,
  supplements,
  isSaving,
  onAdd,
  onRemove,
}: SupplementSectionProps) {
  const [newSupplement, setNewSupplement] = useState("");

  const submitAddition = async () => {
    if (!newSupplement.trim()) return;
    await onAdd(newSupplement);
    setNewSupplement("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitAddition();
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
        {title}
      </p>
      <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-xs">
        {supplements
          .filter((s) => s.active !== false)
          .map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                  <Pill size={16} />
                </div>
                <span className="text-xs font-bold text-brand-text">
                  {item.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="w-7 h-7 rounded-lg bg-[#EFE9DF] text-[#7A7062] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Remove supplement"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

        <div className="p-2.5 pl-3.5 flex items-center justify-between gap-2">
          <input
            type="text"
            value={newSupplement}
            disabled={isSaving}
            onChange={(e) => setNewSupplement(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="bg-transparent text-xs text-brand-text placeholder-[#A3998C] focus:outline-none flex-1"
          />
          <button
            type="button"
            disabled={isSaving || !newSupplement.trim()}
            onClick={submitAddition}
            className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-hover active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}