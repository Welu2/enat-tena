import { ShieldCheck } from "lucide-react";
import { formatSyncedDate } from "@/lib/dateUtils";
import { toSupportedLanguage } from "@/types/report";

interface ProvenanceNoteProps {
  title: string;
  noteText: string;
  generatedAt?: string;
  language: string;
}

export function ProvenanceNoteSection({
  title,
  noteText,
  generatedAt,
  language,
}: ProvenanceNoteProps) {
  const validLang = toSupportedLanguage(language);
  const generatedLabel = validLang === "am"
    ? "የተዘጋጀበት ቀን፦ "
    : "Generated: ";
  const dateFormatted = generatedAt
    ? formatSyncedDate(new Date(generatedAt), validLang).full
    : "";

  return (
    <div className="bg-[#E4ECE7] border border-[#D0DFD6] p-4 rounded-2xl space-y-1.5">
      <div className="flex items-center gap-2 text-brand-green">
        <ShieldCheck size={16} />
        <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-[11px] text-[#294B3B] leading-relaxed">{noteText}</p>
      <p className="text-[10px] text-brand-subtle font-medium pt-1">
        {generatedLabel}
        {dateFormatted}
      </p>
    </div>
  );
}