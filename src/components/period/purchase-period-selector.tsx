"use client";

import { useState } from "react";
import { ChevronDown, Check, Calendar } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

// D-01: Period options as ordered list (not chip row / stepper)
// D-06: Values match the allowlist in setPurchaseDays
const PERIOD_OPTIONS = [1, 2, 3, 5, 7] as const;
type PeriodOption = typeof PERIOD_OPTIONS[number];

/**
 * PurchasePeriodSelector — bottom sheet period picker.
 *
 * D-01: Bottom sheet (not chip row or stepper).
 * D-03: Single shared component used in both carrito and inicio views.
 * D-04: Default period is 1 day (comes from store default).
 * D-05: Period change requires confirmation — confirms clears cart; cancel is a no-op.
 */
export function PurchasePeriodSelector() {
  const [open, setOpen] = useState(false);
  // `confirming` holds the pending new period while user sees confirmation prompt
  const [confirming, setConfirming] = useState<PeriodOption | null>(null);

  const { purchaseDays, setPurchaseDays, clear } = useCartStore();

  const handleTrigger = () => {
    setConfirming(null);
    setOpen(true);
  };

  const handleClose = () => {
    setConfirming(null);
    setOpen(false);
  };

  // D-05: Tapping an option triggers confirmation (unless already selected)
  const handleSelect = (days: PeriodOption) => {
    if (days === purchaseDays) {
      // Already selected — close without prompting
      setOpen(false);
      return;
    }
    setConfirming(days);
  };

  // D-05: User confirms → clear cart + update period
  const handleConfirm = () => {
    if (confirming === null) return;
    setPurchaseDays(confirming);  // T-1-01: allowlist guard inside setPurchaseDays
    clear();                      // D-11: clear() does NOT reset purchaseDays
    setConfirming(null);
    setOpen(false);
  };

  const handleCancel = () => {
    setConfirming(null);
    // Keep the sheet open so user can pick a different option
  };

  const periodLabel = purchaseDays === 1 ? "1 día" : `${purchaseDays} días`;

  return (
    <>
      {/* D-02: Trigger button placed below MacroBar by the parent component */}
      <button
        onClick={handleTrigger}
        className="w-full mt-3 mb-4 flex items-center justify-between px-4 py-3.5 rounded-2xl bg-card shadow-card text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-sub">
          <Calendar size={15} />
          <span className="font-medium">Comprando para</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-text">{periodLabel}</span>
          <ChevronDown size={15} className="text-sub" />
        </div>
      </button>

      {/* Bottom sheet overlay — closes on backdrop tap (D-01) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[100]"
          onClick={handleClose}
          role="presentation"
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
            role="listbox"
            aria-label="Seleccionar período de compra"
          >
            <p className="text-xs font-bold text-sub uppercase tracking-wider mb-4">
              Período de compra
            </p>

            {confirming !== null ? (
              /* D-05: Confirmation prompt — shown only when a new period is tapped */
              <div>
                <p className="text-sm font-semibold text-text mb-1">
                  ¿Cambiar período y limpiar carrito?
                </p>
                <p className="text-xs text-sub mb-4">
                  Cambiar de {periodLabel} a {confirming === 1 ? "1 día" : `${confirming} días`} vaciará tu carrito actual.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-2.5 rounded-[10px] bg-primary text-white font-bold text-xs"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2.5 rounded-[10px] bg-card border-2 border-border text-sub font-semibold text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Period option list */
              <div role="group">
                {PERIOD_OPTIONS.map((days) => {
                  const isSelected = days === purchaseDays;
                  const label = days === 1 ? "1 día" : `${days} días`;
                  return (
                    <button
                      key={days}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(days)}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-left flex justify-between items-center mb-2 transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-card border border-border text-text"
                      }`}
                    >
                      <span>{label}</span>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
