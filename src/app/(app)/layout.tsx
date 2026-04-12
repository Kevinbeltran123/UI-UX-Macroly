"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import { useCartStore } from "@/stores/cart-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const itemCount = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <div
      className="min-h-screen bg-bg"
      style={{
        paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <ToastProvider />
      <main id="main-content">{children}</main>
      <BottomNav cartCount={itemCount} />
    </div>
  );
}
