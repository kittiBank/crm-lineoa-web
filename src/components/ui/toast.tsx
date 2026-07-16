"use client";

import React, { useContext } from "react";
import { ToastContext } from "@/lib/toast-context";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function ToastContainer() {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {context.toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => context.removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  };
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const baseStyles =
    "flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-in slide-in-from-top fade-in";

  const typeStyles = {
    success:
      "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
    error:
      "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
    info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={`${baseStyles} ${typeStyles[toast.type]}`}>
      {icons[toast.type]}
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
