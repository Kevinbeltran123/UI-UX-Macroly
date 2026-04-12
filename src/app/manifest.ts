import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Macroly - Nutricion inteligente",
    short_name: "Macroly",
    description: "Compra inteligente con tus macronutrientes en tiempo real",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#1B5E20",
    theme_color: "#1B5E20",
    orientation: "portrait",
    lang: "es",
    dir: "ltr",
    categories: ["food", "health", "shopping", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Catalogo",
        short_name: "Catalogo",
        description: "Explorar productos",
        url: "/catalogo",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Carrito",
        short_name: "Carrito",
        description: "Ver tu carrito actual",
        url: "/carrito",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Educacion",
        short_name: "Aprender",
        description: "Articulos de nutricion",
        url: "/educacion",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
