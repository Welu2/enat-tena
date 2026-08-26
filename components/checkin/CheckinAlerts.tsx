"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";

interface CheckinAlertsProps {
  dangerAlert: boolean;
  errorMessage: string | null;
  language: string;
}

export function CheckinAlerts({
  dangerAlert,
  errorMessage,
  language,
}: CheckinAlertsProps) {
  if (!dangerAlert && !errorMessage) return null;

  return (
    <div className="space-y-2 mt-3 animate-in slide-in-from-top-2">
      {dangerAlert && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-xs font-semibold shadow-xs">
          <AlertTriangle size={20} className="flex-shrink-0 text-red-600" />
          <p>
            {language === "am"
              ? "አስቸኳይ ማስጠንቀቂያ፦ የተመዘገበው ምልክት የህክምና ክትትል ያስፈልገዋል። በአቅራቢያዎ ወደሚገኝ ጤና ጣቢያ ወይም ሆስፒታል በአስቸኳይ ይሂዱ።"
              : "Clinical Alert: A severe symptom requiring prompt medical evaluation was identified."}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-xs font-medium">
          <AlertCircle size={16} className="flex-shrink-0 text-amber-700" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}