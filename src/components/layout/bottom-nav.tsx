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
      className="fixed bottom-0 left-0 right-0 bg-white/94 backdrop-blur-xl border-t border-border-l flex justify-around pt-2 z-50"
      style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 relative transition-opacity",
              active ? "opacity-100" : "opacity-45",
            )}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.5 : 2}
              className={active ? "text-primary-dark" : "text-text"}
            />
            <span
              className={cn(
                "text-[9px] font-semibold",
                active ? "text-primary-dark" : "text-text",
              )}
            >
              {label}
            </span>
            {href === "/carrito" && cartCount > 0 && (
              <span className="absolute -top-0.5 right-0.5 min-w-[15px] h-[15px] rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center px-1 animate-[badgePulse_0.3s_ease]">
                {cartCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
