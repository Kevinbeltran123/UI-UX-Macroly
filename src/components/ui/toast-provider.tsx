"use client";

import { useToastStore } from "@/stores/toast-store";
import { AlertTriangle, AlertCircle } from "lucide-react";

const STYLES = {
  success: { bg: "bg-[#1B3D2A]", text: "text-white", Icon: null, role: "status" as const, live: "polite" as const },
  warning: { bg: "bg-[#92400E]", text: "text-white", Icon: AlertTriangle, role: "status" as const, live: "polite" as const },
  error:   { bg: "bg-error",     text: "text-white", Icon: AlertCircle,  role: "alert"  as const, live: "assertive" as const },
} as const;

export const ToastProvider = () => {
  const { toasts } = useToastStore();

  return (
    <div
      /* bottom = nav height (~56px) + safe-area-inset-bottom + 12px breathing room.
         Static bottom-20 (80px) overlapped the nav icons on iPhones with home indicator. */
      style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px) + 12px)" }}
      className="fixed inset-x-0 z-200 flex flex-col items-center gap-2 pointer-events-none"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => {
        const s = STYLES[toast.type];
        const Icon = s.Icon;
        return (
          <div
            key={toast.id}
            role={s.role}
            aria-live={s.live}
            aria-atomic="true"
            className={`${s.bg} ${s.text} rounded-full px-4 py-2 flex items-center gap-2 shadow-lg pointer-events-none animate-[staggerFadeUp_0.25s_ease_both] max-w-70`}
          >
            {Icon && <Icon size={13} aria-hidden="true" className="shrink-0" />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
