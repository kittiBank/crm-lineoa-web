import { useCallback, useContext, useMemo } from "react";
import { ToastContext } from "@/lib/toast-context";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      context.addToast({ id, message, type });

      setTimeout(() => {
        context.removeToast(id);
      }, duration);

      return id;
    },
    [context]
  );

  const success = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast],
  );
  const error = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast],
  );
  const info = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast],
  );
  const warning = useCallback(
    (message: string) => showToast(message, "warning"),
    [showToast],
  );

  return useMemo(
    () => ({
      success,
      error,
      info,
      warning,
    }),
    [success, error, info, warning],
  );
}
