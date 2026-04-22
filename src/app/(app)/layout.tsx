"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import { useCartStore } from "@/stores/cart-store";
import { useGoalsStore } from "@/stores/goals-store";
import { useEffect } from "react";

// GoalsLoader: fetches real user goals from Supabase once per session.
// Lives in layout so goals are available before any call site renders.
// D-08: single fetch location — not in each component.
function GoalsLoader() {
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);
  useEffect(() => {
    fetchGoals();
  }, []); // empty deps: fires once on mount, not on every re-render
  return null;
}

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
      <GoalsLoader />
      <ToastProvider />
      <main id="main-content">{children}</main>
      <BottomNav cartCount={itemCount} />
    </div>
  );
}
