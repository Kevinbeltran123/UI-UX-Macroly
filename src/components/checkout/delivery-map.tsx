"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Interactive map with a draggable marker. Uses OpenStreetMap tiles via Leaflet —
 * no API key required. The parent owns the lat/lng state and is notified on
 * marker drag end (debounced reverse geocoding happens upstream).
 */

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  /** When the parent updates lat/lng programmatically (e.g., "Use my location"),
   * we recentre the map. */
  recenterKey?: number;
  height?: number;
};

/* Custom green pin matching brand. */
const macrolyPin = L.divIcon({
  className: "macroly-pin",
  iconSize: [36, 44],
  iconAnchor: [18, 42],
  html: `
    <svg viewBox="0 0 36 44" width="36" height="44" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
      <path d="M18 0 C 8 0 0 8 0 18 C 0 30 18 44 18 44 C 18 44 36 30 36 18 C 36 8 28 0 18 0 Z"
            fill="#1B3D2A" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="18" cy="17" r="6" fill="#FFFFFF"/>
      <circle cx="18" cy="17" r="3" fill="#2D6A4F"/>
    </svg>`,
});

/* Internal helper: re-centre the map when recenterKey changes. */
function Recenter({ lat, lng, recenterKey }: { lat: number; lng: number; recenterKey?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
    // recenterKey is intentionally part of the deps so the parent can force a fly-to.
  }, [recenterKey, lat, lng, map]);
  return null;
}

export function DeliveryMap({ lat, lng, onChange, recenterKey, height = 220 }: Props) {
  const markerRef = useRef<L.Marker | null>(null);

  return (
    <div className="rounded-2xl overflow-hidden border border-border-l shadow-sm" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <Marker
          position={[lat, lng]}
          icon={macrolyPin}
          draggable
          ref={markerRef}
          eventHandlers={{
            dragend: () => {
              const m = markerRef.current;
              if (!m) return;
              const p = m.getLatLng();
              onChange(p.lat, p.lng);
            },
          }}
        />
        <Recenter lat={lat} lng={lng} recenterKey={recenterKey} />
        <MapTapHandler onTap={onChange} />
      </MapContainer>
    </div>
  );
}

/* Tap-to-relocate: clicking anywhere on the map moves the marker. */
function MapTapHandler({ onTap }: { onTap: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => onTap(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onTap]);
  return null;
}
