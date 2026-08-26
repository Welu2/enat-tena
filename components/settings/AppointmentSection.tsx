import { useRef } from "react";
import { Calendar, ExternalLink, Download } from "lucide-react";
import { userService } from "@/services/user.service";

async function openGoogleCalendar(): Promise<boolean> {
  try {
    const links = await userService.getCalendarLinks();
    if (!links?.google_calendar_url) return false;
    window.open(links.google_calendar_url, "_blank", "noopener,noreferrer");
    return true;
  } catch {
    return false;
  }
}

function downloadIcsCalendar(): void {
  const downloadUrl = userService.getICalDownloadUrl();
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.setAttribute("download", "appointment.ics");
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

interface AppointmentSectionProps {
  title: string;
  dateLabel: string;
  editLabel: string;
  appointmentDate: string;
  language: string;
  onDateChange: (date: string) => void;
  onError: (message: string) => void;
}

export function AppointmentSection({
  title,
  dateLabel,
  editLabel,
  appointmentDate,
  language,
  onDateChange,
  onError,
}: AppointmentSectionProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (dateInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleGoogleCal = async () => {
    const success = await openGoogleCalendar();
    if (!success) {
      onError(
        language === "am"
          ? "የጉግል ካሌንደር ሊንክ ማግኘት አልተቻለም።"
          : "Could not generate Google Calendar link."
      );
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
        {title}
      </p>
      <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-text">
                {dateLabel}
              </h4>
              <input
                ref={dateInputRef}
                type="date"
                value={appointmentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-[11px] text-brand-subtle bg-transparent focus:outline-none cursor-pointer block mt-0.5 font-medium"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={openPicker}
            className="px-3 py-1 bg-[#EBE5DA] hover:bg-[#DDD5C7] text-brand-text text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {editLabel}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#EDE5DA]">
          <button
            type="button"
            onClick={handleGoogleCal}
            className="py-2.5 px-3 rounded-xl bg-white border border-[#E4DCD0] text-brand-text text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F5EFE6] transition-all cursor-pointer"
          >
            <ExternalLink size={13} className="text-brand-green" />
            <span>Google Calendar</span>
          </button>

          <button
            type="button"
            onClick={downloadIcsCalendar}
            className="py-2.5 px-3 rounded-xl bg-white border border-[#E4DCD0] text-brand-text text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F5EFE6] transition-all cursor-pointer"
          >
            <Download size={13} className="text-brand-green" />
            <span>iCal / Apple (.ics)</span>
          </button>
        </div>
      </div>
    </div>
  );
}