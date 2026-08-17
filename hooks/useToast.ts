import { useState, useCallback } from "react";
import { ToastNotification } from "@/types/settings";

export function useToast() {
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ type, message });
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    },
    []
  );

  return { toast, showToast };
}