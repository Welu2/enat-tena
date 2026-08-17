import { Bell, Clock } from "lucide-react";

interface ReminderSectionProps {
  title: string;
  reminderLabel: string;
  reminderSubtext: string;
  timeLabel: string;
  dailyReminder: boolean;
  reminderTime: string;
  onToggleReminder: () => void;
  onTimeChange: (time: string) => void;
}

export function ReminderSection({
  title,
  reminderLabel,
  reminderSubtext,
  timeLabel,
  dailyReminder,
  reminderTime,
  onToggleReminder,
  onTimeChange,
}: ReminderSectionProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
        {title}
      </p>
      <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-xs">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-text">
                {reminderLabel}
              </h4>
              <p className="text-[11px] text-brand-subtle">
                {reminderSubtext}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleReminder}
            className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              dailyReminder ? "bg-brand-green" : "bg-[#DDD5C7]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                dailyReminder ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
              <Clock size={16} />
            </div>
            <span className="text-xs font-bold text-brand-text">
              {timeLabel}
            </span>
          </div>
          <input
            type="time"
            value={reminderTime.slice(0, 5)}
            onChange={(e) => onTimeChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-brand-green cursor-pointer focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}