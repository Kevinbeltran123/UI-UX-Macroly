"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, ShoppingCart, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/inicio", icon: Home, label: "Inicio" },
  { href: "/catalogo", icon: Search, label: "Catálogo" },
  { href: "/carrito", icon: ShoppingCart, label: "Carrito" },
  { href: "/educacion", icon: BookOpen, label: "Educación" },
  { href: "/perfil", icon: User, label: "Perfil" },
] as const;

export const BottomNav = ({ cartCount = 0 }: { cartCount?: number }) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border-l flex justify-around pt-2 z-50"
      style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 relative transition-opacity"
          >
            {/* Indicator line above active icon */}
            <span
              className={cn(
                "absolute -top-2 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200",
                active
                  ? "w-5 bg-primary animate-[navLine_0.2s_ease_out_forwards]"
                  : "w-0 bg-transparent"
              )}
              aria-hidden="true"
            />
            <Icon
              size={20}
              strokeWidth={active ? 2.25 : 1.75}
              className={cn(
                "transition-all duration-150",
                active ? "text-primary-dark" : "text-muted"
              )}
            />
            <span
              className={cn(
                "text-[9px] transition-all duration-150",
                active ? "font-bold text-primary-dark" : "font-medium text-muted"
              )}
            >
              {label}
            </span>
            {href === "/carrito" && cartCount > 0 && (
              /* key={cartCount} forces remount on count change → springPop re-fires every increment */
              <span
                key={cartCount}
                className="absolute -top-0.5 right-0.5 min-w-3.75 h-3.75 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center px-1 animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
              >
                {cartCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
