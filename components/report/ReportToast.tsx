import { CheckCircle2 } from "lucide-react";

interface ReportToastProps {
  message: string | null;
}

export function ReportToast({ message }: ReportToastProps) {
  if (!message) return null;
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
      <div className="p-4 rounded-2xl border shadow-lg flex items-center gap-3 backdrop-blur-md bg-[#F0F7F3]/95 border-[#C8E1D3] text-brand-green">
        <CheckCircle2 size={18} className="flex-shrink-0" />
        <p className="text-xs font-semibold">{message}</p>
      </div>
    </div>
  );
}