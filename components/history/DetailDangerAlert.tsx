import { AlertTriangle } from "lucide-react";

interface DetailDangerAlertProps {
  language: string;
}

export function DetailDangerAlert({ language }: DetailDangerAlertProps) {
  const isAmharic = language === "am";
  const title = isAmharic ? "አስቸኳይ ምልክት" : "Danger Sign Detected";
  const message = isAmharic
    ? "በዚህ ምርመራ ወቅት አስቸኳይ ምልክት ተመዝግቧል።"
    : "A danger sign was detected during this check-in.";

  return (
    <div className="flex items-start gap-3 p-4 rounded-3xl bg-red-50 border border-red-200">
      <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={18} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-red-700">{title}</h3>
        <p className="text-xs text-red-600 mt-1 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}