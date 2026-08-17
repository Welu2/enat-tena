import { CheckCircle2, AlertCircle } from "lucide-react";
import { ToastNotification } from "@/types/settings";

interface ToastAlertProps {
  notification: ToastNotification | null;
}

export function ToastAlert({ notification }: ToastAlertProps) {
  if (!notification) return null;
  const isSuccess = notification.type === "success";

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
      <div
        className={`p-4 rounded-2xl border shadow-lg flex items-center gap-3 backdrop-blur-md ${
          isSuccess
            ? "bg-[#F0F7F3]/95 border-[#C8E1D3] text-brand-green"
            : "bg-[#FDF2F2]/95 border-[#F5C6C6] text-red-700"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={18} className="flex-shrink-0 text-brand-green" />
        ) : (
          <AlertCircle size={18} className="flex-shrink-0 text-red-600" />
        )}
        <p className="text-xs font-semibold leading-snug">
          {notification.message}
        </p>
      </div>
    </div>
  );
}