"use client";

import { useState } from "react";
import { ChevronDown, Check, Calendar } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/cn";

const PERIOD_OPTIONS = [1, 2, 3, 5, 7] as const;
type PeriodOption = typeof PERIOD_OPTIONS[number];

const ANIMATION_DURATION = 260; // ms — matches CSS keyframe duration

export function PurchasePeriodSelector() {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [confirming, setConfirming] = useState<PeriodOption | null>(null);

  const { purchaseDays, setPurchaseDays, clear } = useCartStore();

  const handleTrigger = () => {
    setConfirming(null);
    setIsClosing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setConfirming(null);
      setOpen(false);
    }, ANIMATION_DURATION);
  };

  const handleSelect = (days: PeriodOption) => {
    if (days === purchaseDays) {
      handleClose();
      return;
    }
    setConfirming(days);
  };

  const handleConfirm = () => {
    if (confirming === null) return;
    setPurchaseDays(confirming);
    clear();
    setConfirming(null);
    handleClose();
  };

  const handleCancel = () => {
    setConfirming(null);
  };

  const periodLabel = purchaseDays === 1 ? "1 día" : `${purchaseDays} días`;

  return (
    <>
      <button
        onClick={handleTrigger}
        className="w-full mt-3 mb-4 flex items-center justify-between px-4 py-3.5 rounded-2xl bg-card shadow-card text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-sub">
          <Calendar size={15} aria-hidden="true" />
          <span className="font-medium">Comprando para</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-text">{periodLabel}</span>
          <ChevronDown
            size={15}
            className={cn(
              "text-sub transition-transform duration-200",
              open && !isClosing ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              "fixed inset-0 bg-black/50 z-[100]",
              isClosing
                ? "animate-[overlayFadeOut_260ms_ease_both]"
                : "animate-[overlayFadeIn_260ms_ease_both]"
            )}
            onClick={handleClose}
            role="presentation"
          />

          {/* Sheet panel */}
          <div
            className={cn(
              "fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 pb-10 z-[101]",
              isClosing
                ? "animate-[sheetSlideDown_260ms_cubic-bezier(0.4,0,1,1)_both]"
                : "animate-[sheetSlideUp_260ms_cubic-bezier(0,0,0.2,1)_both]"
            )}
            onClick={(e) => e.stopPropagation()}
            role="listbox"
            aria-label="Seleccionar período de compra"
          >
            {/* Handle bar */}
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" aria-hidden="true" />

            <p className="text-xs font-bold text-sub uppercase tracking-wider mb-4">
              Período de compra
            </p>

            {confirming !== null ? (
              <div className="animate-[fadeInUp_0.18s_ease_both]">
                <p className="text-sm font-semibold text-text mb-1">
                  ¿Cambiar período y limpiar carrito?
                </p>
                <p className="text-xs text-sub mb-4">
                  Cambiar de {periodLabel} a {confirming === 1 ? "1 día" : `${confirming} días`} vaciará tu carrito actual.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold text-xs"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2.5 rounded-lg bg-card border border-border text-sub font-semibold text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div role="group" className="flex flex-col gap-2">
                {PERIOD_OPTIONS.map((days) => {
                  const isSelected = days === purchaseDays;
                  const label = days === 1 ? "1 día" : `${days} días`;
                  return (
                    <button
                      key={days}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(days)}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl text-sm font-bold text-left flex justify-between items-center transition-colors",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-card border border-border text-text active:bg-border-l"
                      )}
                    >
                      <span>{label}</span>
                      {isSelected && <Check size={15} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
