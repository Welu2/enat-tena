import { Scale } from "lucide-react";

interface MuacReminderProps {
  title: string;
  reminderText: string;
}

export function MuacReminderSection({
  title,
  reminderText,
}: MuacReminderProps) {
  return (
    <div className="p-4 rounded-3xl bg-[#FFF8EE] border border-[#F2DEBA] flex items-start gap-3.5">
      <div className="w-10 h-10 rounded-2xl bg-[#FEEBC8] text-[#C05621] flex items-center justify-center flex-shrink-0">
        <Scale size={19} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#7B341E]">{title}</h3>
        <p className="text-xs text-[#9C4221] mt-0.5 font-medium">
          {reminderText}
        </p>
      </div>
    </div>
  );
}