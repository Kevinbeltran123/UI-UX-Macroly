"use client";

import { useToastStore } from "@/stores/toast-store";
import { X, Check, AlertTriangle, AlertCircle } from "lucide-react";

const STYLES = {
  success: { bg: "bg-[#DCFCE7]", border: "border-success", text: "text-[#065F46]", Icon: Check, iconColor: "text-success", role: "status" as const, live: "polite" as const },
  warning: { bg: "bg-[#FEF3C7]", border: "border-warning", text: "text-[#92400E]", Icon: AlertTriangle, iconColor: "text-warning", role: "status" as const, live: "polite" as const },
  error: { bg: "bg-[#FEE2E2]", border: "border-error", text: "text-[#991B1B]", Icon: AlertCircle, iconColor: "text-error", role: "alert" as const, live: "assertive" as const },
} as const;

export const ToastProvider = () => {
  const { toasts, remove } = useToastStore();

  return (
    <div
      className="fixed top-4 left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => {
        const s = STYLES[toast.type];
        return (
          <div
            key={toast.id}
            role={s.role}
            aria-live={s.live}
            aria-atomic="true"
            className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg pointer-events-auto animate-[slideDown_0.3s_ease] motion-reduce:animate-none`}
          >
            <s.Icon size={16} className={s.iconColor} aria-hidden="true" />
            <span className={`${s.text} text-sm font-semibold flex-1`}>{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className={`${s.text} opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current rounded`}
              aria-label="Cerrar notificación"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
