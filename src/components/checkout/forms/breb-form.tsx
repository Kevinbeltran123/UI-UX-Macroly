"use client";

import { useEffect, useMemo, useState } from "react";
import { QrCode, KeyRound } from "lucide-react";
import { Field } from "@/components/a11y/field";
import { PAYMENT_METHODS } from "@/domain/payment/method";
import {
  detectBrebKeyKind,
  brebKeyLabel,
  type BrebKeyKind,
} from "@/domain/payment/validation";
import { cn } from "@/lib/cn";
import { BrebLogo } from "../logos/breb-logo";
import { PaymentHero, PAYMENT_HERO_SURFACES } from "../payment-hero";

export type BrebFormState = {
  llave: string;
  mode: "qr" | "llave";
};

type Props = {
  total: number;
  onSubmit: (form: BrebFormState) => void;
};

export function BrebForm({ total, onSubmit }: Props) {
  const config = PAYMENT_METHODS.breb;
  const [mode, setMode] = useState<"qr" | "llave">("qr");
  const [llave, setLlave] = useState("");

  const kind: BrebKeyKind = useMemo(() => detectBrebKeyKind(llave), [llave]);

  // Lazy-init seed so the QR pattern stays stable across re-renders.
  // useState initializers are the React-sanctioned place for one-shot impure work.
  const [seed] = useState(() => `MCY-${total}-${Date.now()}`);
  const qrPattern = useMemo(() => generateFakeQrPattern(seed), [seed]);

  return (
    <div>
      <PaymentHero
        total={total}
        surfaceCss={PAYMENT_HERO_SURFACES.breb}
        logo={<BrebLogo width={56} height={20} />}
        tagline="Pago inmediato interbancario"
        footer={
          <div className="flex items-center justify-between">
            <span>Banco de la República</span>
            <span className="font-display font-bold text-white">Macroly</span>
          </div>
        }
      />

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-border-l rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setMode("qr")}
          className={cn(
            "py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
            mode === "qr" ? "bg-card shadow-sm text-text" : "text-sub"
          )}
        >
          <QrCode size={14} aria-hidden="true" /> Código QR
        </button>
        <button
          type="button"
          onClick={() => setMode("llave")}
          className={cn(
            "py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
            mode === "llave" ? "bg-card shadow-sm text-text" : "text-sub"
          )}
        >
          <KeyRound size={14} aria-hidden="true" /> Llave Bre-B
        </button>
      </div>

      {mode === "qr" ? (
        <QrPanel total={total} pattern={qrPattern} accent={config.accent} onConfirm={() => onSubmit({ llave: "qr-scanned", mode: "qr" })} />
      ) : (
        <KeyPanel
          total={total}
          llave={llave}
          setLlave={setLlave}
          kind={kind}
          accent={config.accent}
          onConfirm={() => onSubmit({ llave, mode: "llave" })}
        />
      )}
    </div>
  );
}

/* ============================================================ */
/* QR panel — stylized SVG QR with vertical scan-line animation */
/* ============================================================ */

function QrPanel({
  total,
  pattern,
  accent,
  onConfirm,
}: {
  total: number;
  pattern: boolean[][];
  accent: string;
  onConfirm: () => void;
}) {
  const [scanned, setScanned] = useState(false);

  // Auto-trigger "scanned" after 2.4s of being on this panel.
  useEffect(() => {
    const t = setTimeout(() => setScanned(true), 2400);
    return () => clearTimeout(t);
  }, []);

  // After scan completes, brief pause then auto-submit.
  useEffect(() => {
    if (!scanned) return;
    const t = setTimeout(onConfirm, 900);
    return () => clearTimeout(t);
  }, [scanned, onConfirm]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-sub text-center mb-4 max-w-xs">
        Escanea con la app de tu banco. La transferencia se acredita en menos de 20 segundos.
      </p>

      <div
        className={cn(
          "relative bg-card p-4 rounded-2xl border border-border-l shadow-card mb-4",
          scanned && "animate-[qrLock_0.5s_ease]"
        )}
        style={{ width: 240, height: 240 }}
      >
        {/* SVG QR */}
        <svg
          viewBox="0 0 21 21"
          className="w-full h-full"
          shapeRendering="crispEdges"
          aria-label="Código QR Bre-B simulado"
          role="img"
        >
          <rect width="21" height="21" fill="#FFFFFF" />
          {pattern.map((row, y) =>
            row.map(
              (filled, x) =>
                filled && (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width="1"
                    height="1"
                    fill={scanned ? accent : "#1A1A18"}
                    style={{ transition: "fill 0.4s ease" }}
                  />
                )
            )
          )}
        </svg>

        {/* Brand badge in center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md px-2 py-1 shadow-sm border-2 border-white"
          aria-hidden="true"
        >
          <BrebLogo width={48} height={18} />
        </div>

        {/* Scan-line */}
        {!scanned && (
          <div className="absolute inset-4 overflow-hidden rounded-lg pointer-events-none" aria-hidden="true">
            <div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
                boxShadow: `0 0 12px ${accent}, 0 0 4px ${accent}`,
                animation: "qrScan 2.4s linear",
              }}
            />
          </div>
        )}

        {/* Scanned overlay */}
        {scanned && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/85 rounded-2xl animate-[fadeUp_0.3s_ease]"
            aria-hidden="true"
          >
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="24"
                    strokeDashoffset="24"
                    style={{ animation: "checkDraw 0.4s ease forwards" }}
                  />
                </svg>
              </div>
              <p className="font-bold text-sm" style={{ color: accent }}>
                QR escaneado
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="bg-card rounded-xl border border-border-l px-4 py-3 w-full max-w-xs flex items-center justify-between">
        <span className="text-xs text-sub uppercase tracking-wider font-semibold">Monto</span>
        <span className="font-display font-extrabold text-lg text-text tabular-nums">
          ${total.toLocaleString("es-CO")}
        </span>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!scanned}
        className="w-full py-3 rounded-xl text-white font-bold text-sm mt-4 disabled:opacity-40 transition-all"
        style={{ backgroundColor: accent }}
      >
        {scanned ? "Confirmar pago" : "Esperando escaneo…"}
      </button>
    </div>
  );
}

/* ============================================================ */
/* Llave panel — auto-detects key type as user types            */
/* ============================================================ */

function KeyPanel({
  total,
  llave,
  setLlave,
  kind,
  accent,
  onConfirm,
}: {
  total: number;
  llave: string;
  setLlave: (v: string) => void;
  kind: BrebKeyKind;
  accent: string;
  onConfirm: () => void;
}) {
  return (
    <div>
      <Field
        label="Llave Bre-B"
        helper="Puede ser cédula, correo, celular (con @) o un alias"
      >
        {(p) => (
          <input
            {...p}
            value={llave}
            onChange={(e) => setLlave(e.target.value)}
            placeholder="ej: kevin@correo.com  ·  @3001234567  ·  1023456789"
            className="w-full h-11 rounded-xl border border-border bg-card px-3.5 text-sm text-text placeholder:text-muted focus:border-primary outline-none transition-colors"
          />
        )}
      </Field>

      {/* Detected type badge */}
      <div className="h-7 mt-2.5 flex items-center justify-center">
        {kind ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold animate-[fadeUp_0.25s_ease]"
            style={{ backgroundColor: `${accent}1A`, color: accent }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
            Llave de tipo: {brebKeyLabel[kind]}
          </span>
        ) : llave ? (
          <span className="text-[11px] text-muted">Formato no reconocido</span>
        ) : (
          <span className="text-[11px] text-muted">Tipo se detectará automáticamente</span>
        )}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!kind}
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-5 disabled:opacity-40 transition-all active:scale-[0.985]"
        style={{ backgroundColor: accent }}
      >
        Transferir ${total.toLocaleString("es-CO")}
      </button>
    </div>
  );
}

/* ============================================================ */
/* Fake QR pattern generator                                    */
/* ============================================================ */

/**
 * Build a 21x21 boolean matrix that visually resembles a QR code.
 * - 3 finder patterns (corners) — exact spec shape
 * - Bottom-right alignment block
 * - Random fill in the body, deterministic per seed
 */
function generateFakeQrPattern(seed: string): boolean[][] {
  const SIZE = 21;
  const grid: boolean[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => false)
  );

  const drawFinder = (cx: number, cy: number) => {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        const onOuter = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const onInner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        grid[y][x] = onOuter || onInner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(14, 0);
  drawFinder(0, 14);

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Deterministic-ish hash from seed.
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const rand = () => {
    h = (h * 9301 + 49297) % 233280;
    return h / 233280;
  };

  // Fill the rest with deterministic noise — skip finder zones.
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const inFinder =
        (x < 8 && y < 8) ||
        (x > 12 && y < 8) ||
        (x < 8 && y > 12) ||
        (x === 6 && y >= 8 && y <= 12) ||
        (y === 6 && x >= 8 && x <= 12);
      if (inFinder) continue;
      if (rand() > 0.55) grid[y][x] = true;
    }
  }

  // Center dead-zone (we draw a logo overlay there)
  for (let y = 8; y <= 12; y++) {
    for (let x = 8; x <= 12; x++) {
      grid[y][x] = false;
    }
  }

  return grid;
}
