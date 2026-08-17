import { Loader2, AlertTriangle, RotateCw } from "lucide-react";

export function CheckinLoading({ language }: { language: string }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#FAF7F2] gap-3">
      <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      <p className="text-xs font-semibold text-brand-subtle">
        {language === "am"
          ? "የምርመራ ክፍለ-ጊዜ በማዘጋጀት ላይ..."
          : "Starting check-in session..."}
      </p>
    </div>
  );
}

export function CheckinInitError({
  message,
  language,
  onRetry,
}: {
  message: string;
  language: string;
  onRetry: () => void;
}) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-[#FAF7F2] px-6 text-center max-w-md mx-auto">
      <div className="p-5 bg-red-50 border border-red-200 rounded-3xl space-y-3 w-full shadow-xs">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
        <p className="text-xs font-semibold text-red-800 leading-relaxed">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="w-full py-3 rounded-2xl bg-brand-green text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-all cursor-pointer shadow-xs"
        >
          <RotateCw size={14} />
          <span>{language === "am" ? "እንደገና ይሞክሩ" : "Retry"}</span>
        </button>
      </div>
    </main>
  );
}