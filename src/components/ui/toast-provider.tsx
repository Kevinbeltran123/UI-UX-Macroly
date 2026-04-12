"use client";

import { useToastStore } from "@/stores/toast-store";
import { X, Check, AlertTriangle, AlertCircle } from "lucide-react";

const STYLES = {
  success: { bg: "bg-[#DCFCE7]", border: "border-success", text: "text-[#065F46]", Icon: Check, iconColor: "text-success" },
  warning: { bg: "bg-[#FEF3C7]", border: "border-warning", text: "text-[#92400E]", Icon: AlertTriangle, iconColor: "text-warning" },
  error: { bg: "bg-[#FEE2E2]", border: "border-error", text: "text-[#991B1B]", Icon: AlertCircle, iconColor: "text-error" },
} as const;

export const ToastProvider = () => {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const s = STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg pointer-events-auto animate-[slideDown_0.3s_ease]`}
          >
            <s.Icon size={16} className={s.iconColor} />
            <span className={`${s.text} text-sm font-semibold flex-1`}>{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className={`${s.text} opacity-60`}
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
