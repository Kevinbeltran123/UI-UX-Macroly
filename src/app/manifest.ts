import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Macroly - Nutricion inteligente",
    short_name: "Macroly",
    description: "Compra inteligente con macros en tiempo real",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#F5F7F5",
    theme_color: "#1B5E20",
    orientation: "portrait",
    categories: ["food", "health", "shopping"],
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/icons/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
