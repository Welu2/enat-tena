import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { DangerSignItem } from "@/types/report";

interface DangerSignsSectionProps {
  title: string;
  noSignsText: string;
  dangerSigns: DangerSignItem[];
}

export function DangerSignsSection({
  title,
  noSignsText,
  dangerSigns,
}: DangerSignsSectionProps) {
  const hasDanger = dangerSigns.length > 0;
  const containerBg = hasDanger
    ? "bg-red-50/70 border-red-200"
    : "bg-[#FAF7F2] border-[#E4DCD0]";
  const iconBg = hasDanger
    ? "bg-red-100 text-red-600"
    : "bg-[#E2ECE6] text-brand-green";

  return (
    <div
      className={`p-4 rounded-3xl flex items-start gap-3.5 border transition-all ${containerBg}`}
    >
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {hasDanger ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-brand-text">{title}</h3>
        {hasDanger ? (
          <div className="mt-1 space-y-1">
            {dangerSigns.map((ds, idx) => {
              const text = typeof ds === "string"
                ? ds
                : ds.raw_text || ds.category;
              return (
                <p key={idx} className="text-xs font-semibold text-red-700">
                  • {text}
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-brand-subtle mt-0.5">{noSignsText}</p>
        )}
      </div>
    </div>
  );
}