export type PaymentMethod = "card" | "nequi" | "daviplata" | "breb" | "cash";

export type MethodConfig = {
  id: PaymentMethod;
  label: string;
  tagline: string;
  /** Brand-accent color used as a controlled accent (border, icon glow). Card chrome stays Macroly. */
  accent: string;
  /** Soft tint for badges and processing background. */
  accentSoft: string;
  /** Average latency in ms — used by the processing screen so each method *feels* different. */
  latencyMs: number;
  /** Rotated during the processing step (≈ 800ms each). Specific copy = perceived realism. */
  processingMessages: readonly string[];
};

export const PAYMENT_METHODS: Record<PaymentMethod, MethodConfig> = {
  card: {
    id: "card",
    label: "Tarjeta",
    tagline: "Crédito o débito",
    accent: "#1A1F71",
    accentSoft: "#EEF1FA",
    latencyMs: 2600,
    processingMessages: [
      "Conectando con el banco emisor…",
      "Validando tarjeta…",
      "Autorizando transacción…",
    ],
  },
  nequi: {
    id: "nequi",
    label: "Nequi",
    tagline: "Paga con tu celular",
    accent: "#DA0081",
    accentSoft: "#FCE7F3",
    latencyMs: 1600,
    processingMessages: [
      "Enviando notificación a tu Nequi…",
      "Esperando confirmación…",
      "Pago aprobado en Nequi.",
    ],
  },
  daviplata: {
    id: "daviplata",
    label: "Daviplata",
    tagline: "Cuenta digital de Davivienda",
    accent: "#ED1C27",
    accentSoft: "#FEE2E2",
    latencyMs: 1800,
    processingMessages: [
      "Notificación enviada a Daviplata…",
      "Verificando saldo disponible…",
      "Débito autorizado.",
    ],
  },
  breb: {
    id: "breb",
    label: "Bre-B",
    tagline: "Pago inmediato interbancario",
    accent: "#0E7C7B",
    accentSoft: "#E0F2F1",
    latencyMs: 1100,
    processingMessages: [
      "Buscando llave Bre-B…",
      "Validando con tu banco…",
      "Transferencia inmediata acreditada.",
    ],
  },
  cash: {
    id: "cash",
    label: "Efectivo",
    tagline: "Paga al recibir tu pedido",
    accent: "#2D6A4F",
    accentSoft: "#EDF5F0",
    latencyMs: 600,
    processingMessages: [
      "Reservando pedido…",
      "Asignando repartidor…",
      "Listo para entrega contra pago.",
    ],
  },
};

export const PAYMENT_METHOD_ORDER: readonly PaymentMethod[] = [
  "card",
  "nequi",
  "daviplata",
  "breb",
  "cash",
];
