"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { Field } from "@/components/a11y/field";
import { PAYMENT_METHODS, type PaymentMethod } from "@/domain/payment/method";
import {
  formatColombianMobile,
  isColombianMobile,
  isOtpValid,
} from "@/domain/payment/validation";
import { cn } from "@/lib/cn";
import { NequiLogo } from "../logos/nequi-logo";
import { DaviplataLogo } from "../logos/daviplata-logo";
import { PaymentHero, PAYMENT_HERO_SURFACES } from "../payment-hero";

export type WalletFormState = {
  phoneDigits: string;
  otp: string;
};

type Props = {
  total: number;
  method: Extract<PaymentMethod, "nequi" | "daviplata">;
  onSubmit: (form: WalletFormState) => void;
};

type Phase = "phone" | "otp";

export function WalletForm({ total, method, onSubmit }: Props) {
  const config = PAYMENT_METHODS[method];
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneDigits = phone.replace(/\D/g, "");

  const handleSendCode = () => {
    if (!isColombianMobile(phone)) {
      setPhoneError("Ingresa un celular válido (10 dígitos, empieza con 3)");
      return;
    }
    setPhoneError("");
    setPhase("otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleOtpChange = (idx: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
    if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const otpString = otp.join("");
  const otpReady = isOtpValid(otpString);

  useEffect(() => {
    if (phase === "otp" && otpReady) {
      const t = setTimeout(() => onSubmit({ phoneDigits, otp: otpString }), 350);
      return () => clearTimeout(t);
    }
  }, [phase, otpReady, otpString, phoneDigits, onSubmit]);

  const heroLogo = method === "nequi"
    ? <NequiLogo width={56} height={20} />
    : <DaviplataLogo width={70} height={20} />;

  const tagline = method === "nequi"
    ? "Pago desde tu cuenta Nequi"
    : "Cuenta digital de Davivienda";

  /* ============== Phase 1: phone entry ============== */
  if (phase === "phone") {
    return (
      <div>
        <PaymentHero
          total={total}
          surfaceCss={PAYMENT_HERO_SURFACES[method]}
          logo={heroLogo}
          tagline={tagline}
          footer={
            <div className="flex items-center justify-between">
              <span>Comercio</span>
              <span className="font-display font-bold text-white">Macroly</span>
            </div>
          }
        />

        <Field
          label="Celular asociado"
          error={phoneError || undefined}
          helper="Empieza con 3, 10 dígitos"
          required
        >
          {(p) => (
            <div className="flex items-stretch gap-2">
              <span className="h-12 px-3.5 rounded-xl border border-border bg-card text-sm font-mono font-semibold text-sub flex items-center">
                +57
              </span>
              <input
                {...p}
                inputMode="numeric"
                autoComplete="tel-national"
                value={formatColombianMobile(phone)}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="300 123 4567"
                className="flex-1 h-12 rounded-xl border border-border bg-card px-3.5 text-base font-mono tabular-nums text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
              />
            </div>
          )}
        </Field>

        <button
          onClick={handleSendCode}
          className="w-full mt-6 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.985] transition-transform"
          style={{
            backgroundColor: config.accent,
            height: 52,
            boxShadow: `0 8px 22px -8px ${config.accent}80`,
          }}
        >
          <Bell size={15} aria-hidden="true" />
          Enviar notificación a tu celular
        </button>
      </div>
    );
  }

  /* ============== Phase 2: OTP entry ============== */
  return (
    <div>
      <button
        type="button"
        onClick={() => { setPhase("phone"); setOtp(["", "", "", "", "", ""]); }}
        className="text-xs text-sub flex items-center gap-1 mb-4 active:opacity-60"
      >
        <ChevronLeft size={14} aria-hidden="true" /> Cambiar número
      </button>

      <PaymentHero
        total={total}
        surfaceCss={PAYMENT_HERO_SURFACES[method]}
        logo={heroLogo}
        tagline={tagline}
      />

      {/* Simulated push notification — now floating on cream bg, more like a real lockscreen pill */}
      <div className="bg-card rounded-2xl shadow-card border border-border-l p-4 mb-5">
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-0.5" aria-hidden="true">
            {method === "nequi"
              ? <NequiLogo width={32} height={20} />
              : <DaviplataLogo width={42} height={14} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: config.accent }}>
                Notificación enviada
              </p>
              <p className="text-[10px] text-muted">ahora</p>
            </div>
            <p className="text-sm font-bold text-text leading-snug mt-1">
              ¿Autorizas el pago de ${total.toLocaleString("es-CO")}?
            </p>
            <p className="text-[11px] text-sub mt-1">
              Enviado a <span className="font-mono font-semibold text-text">{formatColombianMobile(phone)}</span>
            </p>
          </div>
        </div>
      </div>

      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-semibold text-text mb-3 text-center w-full">
          Código de 6 dígitos
        </legend>

        <div className="flex justify-center gap-2 mb-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el; }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKey(i, e)}
              onPaste={handleOtpPaste}
              aria-label={`Dígito ${i + 1}`}
              className={cn(
                // Width steps: 40px on iPhone SE (<360px), 44px on regular phones (≥360px), 48px on tablet
                "w-10 min-[360px]:w-11 h-12 min-[360px]:h-13 sm:w-12 sm:h-14 text-center font-mono font-extrabold text-xl rounded-xl border-2 bg-card text-text outline-none transition-all tabular-nums",
                digit ? "border-current scale-100" : "border-border",
                digit && "animate-[otpFill_0.28s_cubic-bezier(0.34,1.56,0.64,1)]"
              )}
              style={digit ? { color: config.accent, borderColor: config.accent } : undefined}
            />
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={() => onSubmit({ phoneDigits, otp: otpString })}
        disabled={!otpReady}
        className="w-full mt-6 rounded-xl text-white font-bold text-base disabled:opacity-40 transition-all active:scale-[0.985]"
        style={{
          backgroundColor: config.accent,
          height: 52,
          boxShadow: otpReady ? `0 8px 22px -8px ${config.accent}80` : "none",
        }}
      >
        Confirmar pago
      </button>
    </div>
  );
}
