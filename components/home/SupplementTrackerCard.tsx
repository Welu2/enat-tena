import { ShieldCheck, Loader2 } from "lucide-react";

interface SupplementTrackerCardProps {
  currentSupplementName: string;
  isAllDone: boolean;
  isToggling: boolean;
  completedCount: number;
  totalCount: number;
  doneText: string;
  markDoneText: string;
  onMarkNext: () => void;
}

export function SupplementTrackerCard({
  currentSupplementName,
  isAllDone,
  isToggling,
  completedCount,
  totalCount,
  doneText,
  markDoneText,
  onMarkNext,
}: SupplementTrackerCardProps) {
  const buttonStyle = isAllDone
    ? "bg-[#DDEEE4] text-brand-green border border-brand-green/30"
    : "bg-brand-green text-white hover:bg-brand-green-hover shadow-xs";

  return (
    <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl bg-[#EBE7DF] text-[#8C7A6B] flex items-center justify-center">
          <ShieldCheck size={16} />
        </div>
        {totalCount > 1 && (
          <span className="text-[10px] font-bold text-brand-subtle">
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-[11px] text-brand-subtle font-medium truncate">
          {currentSupplementName}
        </p>

        <button
          type="button"
          disabled={isToggling || isAllDone}
          onClick={onMarkNext}
          className={`mt-1.5 w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${buttonStyle} ${
            isToggling ? "opacity-70" : ""
          }`}
        >
          {isToggling ? (
            <Loader2 size={13} className="animate-spin" />
          ) : isAllDone ? (
            `✓ ${doneText}`
          ) : (
            markDoneText
          )}
        </button>
      </div>
    </div>
  );
}