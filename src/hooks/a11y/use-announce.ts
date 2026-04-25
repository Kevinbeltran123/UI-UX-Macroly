import { useCallback } from "react";

export function useAnnounce() {
  return useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    document.dispatchEvent(
      new CustomEvent("a11y:announce", { detail: { message, priority } })
    );
  }, []);
}
