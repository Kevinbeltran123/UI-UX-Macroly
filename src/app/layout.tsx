import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { PWARegister } from "@/components/pwa-register";
import { Announcer } from "@/components/a11y/announcer";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Macroly — Nutrición inteligente",
  description: "Compra inteligente con tus macronutrientes en tiempo real",
  applicationName: "Macroly",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Macroly",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-120.png", sizes: "120x120" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Macroly",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B5E20" },
    { media: "(prefers-color-scheme: dark)", color: "#1B5E20" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PWARegister />
        <Announcer />
        {/* Status bar mask — fixed cream band that covers content scrolling under the iOS notch.
            Lives in root layout so it covers ALL pages: (app), (auth), and any future route group.
            Height = 0 in browsers / Android (safe-area returns 0); ~47–59px in iOS standalone PWA. */}
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 bg-bg z-40 pointer-events-none"
          style={{ height: "env(safe-area-inset-top, 0px)" }}
        />
        {children}
      </body>
    </html>
  );
}
