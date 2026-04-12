"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import { useCartStore } from "@/stores/cart-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const itemCount = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <div className="min-h-screen bg-bg pb-20">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <ToastProvider />
      <main id="main-content">{children}</main>
      <BottomNav cartCount={itemCount} />
    </div>
  );
}
