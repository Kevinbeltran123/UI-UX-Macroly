"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, MapPin, Check } from "lucide-react";
import { Field } from "@/components/a11y/field";
import {
  reverseGeocode,
  type DeliveryLocation,
  DEFAULT_CENTER,
} from "@/domain/delivery/delivery";

/* Lazy load the Leaflet map — keeps it out of the initial bundle and avoids SSR issues. */
const DeliveryMap = dynamic(
  () => import("./delivery-map").then((m) => m.DeliveryMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl bg-border-l animate-pulse flex items-center justify-center text-sub text-xs"
        style={{ height: 220 }}
      >
        Cargando mapa…
      </div>
    ),
  }
);

type Props = {
  initial: DeliveryLocation | null;
  onConfirm: (loc: DeliveryLocation) => void;
};

export function DeliveryLocationForm({ initial, onConfirm }: Props) {
  const [lat, setLat] = useState(initial?.lat ?? DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(initial?.lng ?? DEFAULT_CENTER.lng);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [recenterKey, setRecenterKey] = useState(0);
  const [geocoding, setGeocoding] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Try to centre on the user's current location once on mount. */
  useEffect(() => {
    if (initial) return; // user already had a saved location
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setRecenterKey((k) => k + 1);
      },
      () => { /* user denied — fall back to DEFAULT_CENTER */ },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60_000 }
    );
  }, [initial]);

  /* Reverse-geocode whenever the marker moves. Debounced + abortable. */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    debounceRef.current = setTimeout(async () => {
      const ac = new AbortController();
      abortRef.current = ac;
      setGeocoding(true);
      const result = await reverseGeocode(lat, lng, ac.signal);
      setGeocoding(false);
      if (result?.street) {
        // Only auto-fill street part. The user keeps control of details/instructions.
        setAddress(result.street);
      } else if (result?.fullAddress) {
        // Take the first 3 segments of the display name as a fallback.
        setAddress(result.fullAddress.split(",").slice(0, 3).join(",").trim());
      }
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [lat, lng]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setRecenterKey((k) => k + 1);
      },
      () => { /* denied */ },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const addressError =
    submitted && address.trim().length < 5 ? "Confirma la dirección" : "";

  const handleConfirm = () => {
    setSubmitted(true);
    if (address.trim().length < 5) return;
    onConfirm({
      lat,
      lng,
      address: address.trim(),
      details: details.trim(),
      instructions: instructions.trim(),
    });
  };

  return (
    <div>
      <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-muted font-semibold mb-2.5">
        ¿Dónde entregamos?
      </p>

      {/* Map with floating "use my location" button */}
      <div className="relative mb-4">
        <DeliveryMap
          lat={lat}
          lng={lng}
          onChange={(la, ln) => {
            setLat(la);
            setLng(ln);
          }}
          recenterKey={recenterKey}
          height={220}
        />
        <button
          type="button"
          onClick={useMyLocation}
          className="absolute bottom-3 right-3 bg-card text-sub w-10 h-10 rounded-full shadow-card flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Usar mi ubicación"
        >
          <Crosshair size={16} aria-hidden="true" />
        </button>
        {geocoding && (
          <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-[0.625rem] font-bold text-sub flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            Buscando dirección…
          </div>
        )}
      </div>

      <p className="text-[0.6875rem] text-muted leading-snug mb-4 px-1">
        Arrastra el pin o toca el mapa para ajustar el punto exacto.
      </p>

      <div className="space-y-3">
        <Field label="Dirección" error={addressError || undefined} required>
          {(p) => (
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                {...p}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle 123 #45-67"
                className="w-full h-12 rounded-xl border border-border bg-card pl-9 pr-3.5 text-base text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
              />
            </div>
          )}
        </Field>

        <Field label="Detalles" helper="Apartamento, torre, referencia">
          {(p) => (
            <input
              {...p}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Apto 802, Torre 3"
              className="w-full h-12 rounded-xl border border-border bg-card px-3.5 text-base text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
            />
          )}
        </Field>

        <Field label="Instrucciones para el repartidor" helper="Opcional">
          {(p) => (
            <input
              {...p}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Dejar en portería · Llamar al llegar"
              className="w-full h-12 rounded-xl border border-border bg-card px-3.5 text-base text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
            />
          )}
        </Field>
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        className="w-full mt-6 rounded-xl bg-primary-dark text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.985] transition-transform shadow-[0_8px_22px_-8px_rgba(27,61,42,0.55)]"
        style={{ height: 52 }}
      >
        <Check size={16} aria-hidden="true" />
        Confirmar ubicación
      </button>
    </div>
  );
}
