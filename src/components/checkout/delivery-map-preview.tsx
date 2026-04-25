"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Read-only mini map for the checkout overview. All interactions are disabled
 * so the parent can wrap it in a tap-target that opens the full edit step.
 */

type Props = {
  lat: number;
  lng: number;
  height?: number;
};

const macrolyPin = L.divIcon({
  className: "macroly-pin-preview",
  iconSize: [32, 40],
  iconAnchor: [16, 38],
  html: `
    <svg viewBox="0 0 36 44" width="32" height="40" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));">
      <path d="M18 0 C 8 0 0 8 0 18 C 0 30 18 44 18 44 C 18 44 36 30 36 18 C 36 8 28 0 18 0 Z"
            fill="#1B3D2A" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="18" cy="17" r="6" fill="#FFFFFF"/>
      <circle cx="18" cy="17" r="3" fill="#2D6A4F"/>
    </svg>`,
});

function FitTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: false });
  }, [lat, lng, map]);
  return null;
}

export function DeliveryMapPreview({ lat, lng, height = 180 }: Props) {
  return (
    <div style={{ height }} className="relative w-full pointer-events-none">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        touchZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <Marker position={[lat, lng]} icon={macrolyPin} interactive={false} />
        <FitTo lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
