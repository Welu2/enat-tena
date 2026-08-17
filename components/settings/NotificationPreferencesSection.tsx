import { Bell } from "lucide-react";

interface NotificationSectionProps {
  title: string;
  checkinLabel: string;
  approachingLabel: string;
  checkinReminder: boolean;
  apptApproaching: boolean;
  onToggleCheckin: () => void;
  onToggleApproaching: () => void;
}

export function NotificationPreferencesSection({
  title,
  checkinLabel,
  approachingLabel,
  checkinReminder,
  apptApproaching,
  onToggleCheckin,
  onToggleApproaching,
}: NotificationSectionProps) {
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
            <h4 className="text-xs font-bold text-brand-text">
              {checkinLabel}
            </h4>
          </div>
          <button
            type="button"
            onClick={onToggleCheckin}
            className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              checkinReminder ? "bg-brand-green" : "bg-[#DDD5C7]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                checkinReminder ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
              <Bell size={16} />
            </div>
            <h4 className="text-xs font-bold text-brand-text">
              {approachingLabel}
            </h4>
          </div>
          <button
            type="button"
            onClick={onToggleApproaching}
            className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              apptApproaching ? "bg-brand-green" : "bg-[#DDD5C7]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                apptApproaching ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}