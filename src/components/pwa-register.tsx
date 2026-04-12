"use client";

import { useEffect } from "react";

export const PWARegister = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silently fail — SW is progressive enhancement
      }
    };
    register();
  }, []);

  return null;
};
