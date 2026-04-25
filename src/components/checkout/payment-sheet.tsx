"use client";

import { useReducer, useEffect, useRef, useId } from "react";
import { X, ChevronLeft, AlertCircle, RotateCw } from "lucide-react";
import { useFocusTrap } from "@/hooks/a11y/use-focus-trap";
import { useEscapeKey } from "@/hooks/a11y/use-escape-key";
import { useReturnFocus } from "@/hooks/a11y/use-return-focus";
import { PAYMENT_METHODS, type PaymentMethod } from "@/domain/payment/method";
import {
  simulateCard,
  simulateWallet,
  simulateBreb,
  simulateCash,
  type SimResult,
  type PaymentMeta,
} from "@/domain/payment/simulation";
import {
  type Delivery,
  type DeliveryLocation,
  type DeliverySpeed,
  DELIVERY_SPEED_FEE,
} from "@/domain/delivery/delivery";
import { CheckoutOverview } from "./checkout-overview";
import { DeliveryLocationForm } from "./delivery-location-form";
import { MethodPicker } from "./method-picker";
import { CardForm, type CardFormState } from "./forms/card-form";
import { WalletForm, type WalletFormState } from "./forms/wallet-form";
import { BrebForm, type BrebFormState } from "./forms/breb-form";
import { CashForm, type CashFormState } from "./forms/cash-form";
import { ProcessingScreen } from "./processing-screen";
import { ReceiptCard } from "./receipt-card";

/* ------------------------------------------------------------------ */
/* State machine                                                       */
/* ------------------------------------------------------------------ */

type Step =
  | "overview"   // landing — shows location + method + summary
  | "location"   // sub-step: edit delivery address (with map)
  | "method"     // sub-step: pick payment method
  | "form"       // method-specific form
  | "processing"
  | "receipt"
  | "failure";

type State = {
  step: Step;
  delivery: Delivery | null;
  method: PaymentMethod | null;
  result: SimResult | null;
  meta: PaymentMeta;
};

type Action =
  | { type: "OPEN_LOCATION" }
  | { type: "SET_LOCATION"; location: DeliveryLocation }
  | { type: "SET_SPEED"; speed: DeliverySpeed }
  | { type: "OPEN_METHOD" }
  | { type: "PICK_METHOD"; method: PaymentMethod }
  | { type: "BACK_TO_OVERVIEW" }
  | { type: "CONTINUE" }
  | { type: "SUBMIT"; result: SimResult; meta: PaymentMeta }
  | { type: "PROCESSING_DONE" }
  | { type: "RETRY" }
  | { type: "RESET" };

const initial: State = {
  step: "overview",
  delivery: null,
  method: null,
  result: null,
  meta: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_LOCATION":
      return { ...state, step: "location" };
    case "SET_LOCATION": {
      const speed: DeliverySpeed = state.delivery?.speed ?? "standard";
      return {
        ...state,
        delivery: { ...action.location, speed },
        step: "overview",
      };
    }
    case "SET_SPEED":
      return state.delivery
        ? { ...state, delivery: { ...state.delivery, speed: action.speed } }
        : state;
    case "OPEN_METHOD":
      return { ...state, step: "method" };
    case "PICK_METHOD":
      return { ...state, method: action.method, step: "overview" };
    case "BACK_TO_OVERVIEW":
      return { ...state, step: "overview" };
    case "CONTINUE":
      if (!state.method) return state;
      return { ...state, step: "form" };
    case "SUBMIT":
      return { ...state, step: "processing", result: action.result, meta: action.meta };
    case "PROCESSING_DONE":
      if (!state.result) return state;
      return {
        ...state,
        step: state.result.kind === "approved" ? "receipt" : "failure",
      };
    case "RETRY":
      return { ...state, step: "form", result: null };
    case "RESET":
      return initial;
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export type PaymentSuccess = {
  method: PaymentMethod;
  transactionRef: string;
  meta: PaymentMeta;
  delivery: Delivery;
  deliveryFee: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Subtotal (cart total before delivery fee). */
  subtotal: number;
  itemCount: number;
  onSuccess: (payload: PaymentSuccess) => void;
};

export function PaymentSheet({ open, onClose, subtotal, itemCount, onSuccess }: Props) {
  const [state, dispatch] = useReducer(reducer, initial);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useFocusTrap(panelRef, open);
  useEscapeKey(() => {
    if (state.step === "processing") return;
    if (state.step === "location" || state.step === "method") {
      dispatch({ type: "BACK_TO_OVERVIEW" });
      return;
    }
    onClose();
  }, open);
  useReturnFocus(open);

  useEffect(() => {
    if (!open) dispatch({ type: "RESET" });
  }, [open]);

  useEffect(() => {
    if (state.step !== "processing" || !state.method) return;
    const ms = PAYMENT_METHODS[state.method].latencyMs;
    const t = setTimeout(() => dispatch({ type: "PROCESSING_DONE" }), ms);
    return () => clearTimeout(t);
  }, [state.step, state.method]);

  const fee = state.delivery ? DELIVERY_SPEED_FEE[state.delivery.speed] : 0;
  const total = subtotal + fee;

  const onReceiptConfirm = () => {
    if (state.result?.kind !== "approved" || !state.method || !state.delivery) return;
    onSuccess({
      method: state.method,
      transactionRef: state.result.transactionRef,
      meta: state.meta,
      delivery: state.delivery,
      deliveryFee: fee,
    });
  };

  if (!open) return null;

  const showBack =
    state.step === "location" ||
    state.step === "method" ||
    state.step === "form" ||
    state.step === "failure";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/55 z-[99] animate-[overlayFadeIn_260ms_ease_both]"
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 z-100 bg-bg rounded-t-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden animate-[sheetSlideUp_300ms_cubic-bezier(0,0,0.2,1)_both] motion-reduce:animate-none"
      >
        <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-md border-b border-border-l">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mt-2" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            {showBack ? (
              <button
                onClick={() => dispatch({ type: "BACK_TO_OVERVIEW" })}
                className="-ml-1 h-10 px-2.5 rounded-lg flex items-center gap-1 text-text font-bold text-[13px] active:bg-border-l transition-colors"
                aria-label="Volver al resumen"
              >
                <ChevronLeft size={18} className="-ml-0.5" aria-hidden="true" />
                Resumen
              </button>
            ) : (
              <span className="w-[88px]" aria-hidden="true" />
            )}
            <h2
              id={titleId}
              className="font-display font-extrabold text-[12px] uppercase tracking-[0.12em] text-text whitespace-nowrap truncate min-w-0 flex-1 text-center"
            >
              {stepTitle(state.step)}
            </h2>
            <div className="flex justify-end" style={{ minWidth: 88 }}>
              <button
                onClick={onClose}
                disabled={state.step === "processing"}
                className="w-10 h-10 -mr-1 rounded-lg flex items-center justify-center text-sub active:bg-border-l transition-colors disabled:opacity-30"
                aria-label="Cerrar todo"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 pb-8 animate-[fadeUp_0.28s_ease]" key={state.step}>
          {state.step === "overview" && (
            <CheckoutOverview
              subtotal={subtotal}
              itemCount={itemCount}
              delivery={state.delivery}
              method={state.method}
              onEditLocation={() => dispatch({ type: "OPEN_LOCATION" })}
              onEditMethod={() => dispatch({ type: "OPEN_METHOD" })}
              onChangeSpeed={(speed) => dispatch({ type: "SET_SPEED", speed })}
              onContinue={() => {
                if (!state.method || !state.delivery) return;
                dispatch({ type: "CONTINUE" });
              }}
            />
          )}

          {state.step === "location" && (
            <DeliveryLocationForm
              initial={state.delivery}
              onConfirm={(loc) => dispatch({ type: "SET_LOCATION", location: loc })}
            />
          )}

          {state.step === "method" && (
            <MethodPicker
              total={total}
              itemCount={itemCount}
              onPick={(method) => dispatch({ type: "PICK_METHOD", method })}
            />
          )}

          {state.step === "form" && state.method === "card" && (
            <CardForm
              total={total}
              onSubmit={(form: CardFormState) => {
                const result = simulateCard({ digits: form.digits, cvv: form.cvv });
                dispatch({
                  type: "SUBMIT",
                  result,
                  meta: {
                    last4: form.digits.slice(-4),
                    brand: form.brand,
                    issuer: form.issuer ?? undefined,
                    holder: form.holder,
                    cuotas: form.cuotas,
                  },
                });
              }}
            />
          )}

          {state.step === "form" && (state.method === "nequi" || state.method === "daviplata") && (
            <WalletForm
              total={total}
              method={state.method}
              onSubmit={(form: WalletFormState) => {
                const result = simulateWallet({ phoneDigits: form.phoneDigits, otp: form.otp });
                dispatch({
                  type: "SUBMIT",
                  result,
                  meta: { phone: form.phoneDigits },
                });
              }}
            />
          )}

          {state.step === "form" && state.method === "breb" && (
            <BrebForm
              total={total}
              onSubmit={(form: BrebFormState) => {
                const result = simulateBreb({ llave: form.llave });
                dispatch({
                  type: "SUBMIT",
                  result,
                  meta: { llave: form.llave, mode: form.mode },
                });
              }}
            />
          )}

          {state.step === "form" && state.method === "cash" && (
            <CashForm
              total={total}
              onSubmit={(form: CashFormState) => {
                const result = simulateCash();
                dispatch({
                  type: "SUBMIT",
                  result,
                  meta: { paidAmount: form.paidAmount ?? undefined },
                });
              }}
            />
          )}

          {state.step === "processing" && state.method && (
            <ProcessingScreen method={state.method} />
          )}

          {state.step === "receipt" && state.method && state.result?.kind === "approved" && state.delivery && (
            <ReceiptCard
              method={state.method}
              total={total}
              itemCount={itemCount}
              transactionRef={state.result.transactionRef}
              meta={state.meta}
              delivery={state.delivery}
              deliveryFee={fee}
              onContinue={onReceiptConfirm}
            />
          )}

          {state.step === "failure" && state.result?.kind === "declined" && state.method && (
            <FailureScreen
              method={state.method}
              reason={state.result.reason}
              onRetry={() => dispatch({ type: "RETRY" })}
              onChangeMethod={() => dispatch({ type: "OPEN_METHOD" })}
            />
          )}
        </div>
      </div>
    </>
  );
}

function stepTitle(step: Step): string {
  switch (step) {
    case "overview":   return "Finalizar pago";
    case "location":   return "Ubicación";
    case "method":     return "Método de pago";
    case "form":       return "Confirmar pago";
    case "processing": return "Procesando";
    case "receipt":    return "Comprobante";
    case "failure":    return "No se pudo cobrar";
  }
}

function FailureScreen({
  method,
  reason,
  onRetry,
  onChangeMethod,
}: {
  method: PaymentMethod;
  reason: string;
  onRetry: () => void;
  onChangeMethod: () => void;
}) {
  const config = PAYMENT_METHODS[method];
  return (
    <div className="text-center pt-2 animate-[errShake_0.45s_ease]">
      <div
        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: "#FEE2E2" }}
      >
        <AlertCircle size={28} className="text-error" aria-hidden="true" />
      </div>
      <h3 className="font-display font-extrabold text-xl text-text mb-1.5">
        Pago no procesado
      </h3>
      <p className="text-sm text-sub mb-5 max-w-xs mx-auto">{reason}</p>
      <div
        className="bg-card rounded-xl p-3 mb-5 border border-border-l text-xs text-muted flex items-center justify-center gap-2"
        style={{ borderColor: config.accentSoft }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accent }} aria-hidden="true" />
        Intento con {config.label}
      </div>
      <button
        onClick={onRetry}
        className="w-full py-3 rounded-xl bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 mb-2"
      >
        <RotateCw size={15} aria-hidden="true" /> Reintentar
      </button>
      <button
        onClick={onChangeMethod}
        className="w-full py-3 rounded-xl border border-border text-sub font-semibold text-sm active:bg-border-l transition-colors"
      >
        Cambiar método de pago
      </button>
    </div>
  );
}
