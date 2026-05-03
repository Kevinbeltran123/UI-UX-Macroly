"use client";

import { useEffect, useState } from "react";
import { PAYMENT_METHODS, type PaymentMethod } from "@/domain/payment/method";

type Props = { method: PaymentMethod };

export function ProcessingScreen({ method }: Props) {
  const config = PAYMENT_METHODS[method];
  const messages = config.processingMessages;
  const stepDuration = config.latencyMs / messages.length;

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const intervals: ReturnType<typeof setTimeout>[] = [];
    messages.forEach((_, i) => {
      if (i === 0) return;
      intervals.push(setTimeout(() => setActiveIdx(i), stepDuration * i));
    });
    return () => intervals.forEach(clearTimeout);
  }, [messages, stepDuration]);

  return (
    <div className="text-center pt-2 pb-4">
      {/* Spinning ring with method-color */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div
          className="absolute inset-0 rounded-full border-4 border-border-l"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: config.accent,
            borderRightColor: config.accent,
            animation: "ringSpin 0.9s linear infinite",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-2 rounded-full" style={{ backgroundColor: config.accentSoft }} aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-xs uppercase tracking-[0.18em]" style={{ color: config.accent }}>
          {config.label}
        </div>
      </div>

      {/* Stepwise messages */}
      <div className="space-y-2.5 max-w-xs mx-auto" aria-live="polite">
        {messages.map((msg, i) => {
          const status = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
          return (
            <div
              key={i}
              className="flex items-center gap-3 text-left transition-opacity"
              style={{ opacity: status === "pending" ? 0.35 : 1 }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  backgroundColor:
                    status === "done"   ? config.accent :
                    status === "active" ? config.accentSoft :
                                          "transparent",
                  border: status === "pending" ? `2px solid var(--color-border)` : "none",
                }}
                aria-hidden="true"
              >
                {status === "done" && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {status === "active" && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: config.accent,
                      animation: "dotPulse 1s ease-in-out infinite",
                    }}
                  />
                )}
              </span>
              <span
                className={
                  status === "active"
                    ? "text-sm font-semibold text-text"
                    : "text-sm text-sub"
                }
              >
                {msg}
              </span>
            </div>
          );
        })}
      </div>

      {/* Shimmer band */}
      <div className="mt-7 max-w-[200px] mx-auto h-[3px] rounded-full bg-border-l overflow-hidden" aria-hidden="true">
        <div className="h-full w-full shimmer-band" />
      </div>

      <p className="text-[0.6875rem] text-muted mt-5">
        No cierres esta ventana
      </p>
    </div>
  );
}
