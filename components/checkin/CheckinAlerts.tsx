interface CheckinAlertsProps {
  dangerAlert?: boolean | string | null;
  errorMessage?: string | null;
  language?: string;
}

export function CheckinAlerts({
  dangerAlert,
  errorMessage,
  language = "en",
}: CheckinAlertsProps) {
  const hasDanger = Boolean(dangerAlert);
  const dangerMessage =
    typeof dangerAlert === "string"
      ? dangerAlert
      : language === "am"
      ? "የአደጋ ምልክት ተለይቷል! እባክዎ በአቅራቢያዎ የሚገኝ የጤና ጣቢያ ያነጋግሩ።"
      : "Danger sign detected! Please contact your healthcare provider immediately.";

  if (!hasDanger && !errorMessage) return null;

  return (
    <div className="space-y-2 mb-3">
      {hasDanger && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {dangerMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
}