"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import { useCartStore } from "@/stores/cart-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const itemCount = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <div className="min-h-screen bg-bg pb-20">
      <ToastProvider />
      {children}
      <BottomNav cartCount={itemCount} />
    </div>
  );
}
