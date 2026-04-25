/**
 * Delivery types — what we collect from the user before payment.
 */

export type DeliverySpeed = "standard" | "fast";

export type DeliveryLocation = {
  lat: number;
  lng: number;
  /** Street-level address auto-filled from reverse geocoding (editable). */
  address: string;
  /** Apt / floor / tower. Free text. */
  details: string;
  /** Reception preference / instructions. Free text. */
  instructions: string;
};

export type Delivery = DeliveryLocation & {
  speed: DeliverySpeed;
};

/** Default centre for the map when geolocation isn't available. Ibagué centro. */
export const DEFAULT_CENTER: { lat: number; lng: number } = {
  lat: 4.4389,
  lng: -75.2322,
};

export const DELIVERY_SPEED_FEE: Record<DeliverySpeed, number> = {
  standard: 0,
  fast: 3000,
};

export const DELIVERY_SPEED_ETA: Record<DeliverySpeed, string> = {
  standard: "30–45 min",
  fast: "15–25 min",
};

/**
 * Quick reverse-geocoding via OpenStreetMap Nominatim.
 * Free, no API key. Policy: ≤ 1 req/sec — caller must throttle/debounce.
 */
export type GeocodeResult = {
  fullAddress: string;
  street: string;
  neighborhood: string;
  city: string;
};

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<GeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`;
    const res = await fetch(url, {
      signal,
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const street = [a.road, a.house_number].filter(Boolean).join(" ");
    const neighborhood = a.neighbourhood ?? a.suburb ?? a.quarter ?? "";
    const city = a.city ?? a.town ?? a.village ?? a.municipality ?? "";
    return {
      fullAddress: data.display_name ?? "",
      street: street || a.road || "",
      neighborhood,
      city,
    };
  } catch {
    return null;
  }
}
