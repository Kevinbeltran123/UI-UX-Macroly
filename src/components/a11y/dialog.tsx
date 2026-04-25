"use client";

import { useRef, useId, type ReactNode } from "react";
import { useFocusTrap } from "@/hooks/a11y/use-focus-trap";
import { useEscapeKey } from "@/hooks/a11y/use-escape-key";
import { useReturnFocus } from "@/hooks/a11y/use-return-focus";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useFocusTrap(panelRef, open);
  useEscapeKey(onClose, open);
  useReturnFocus(open);

  if (!open) return null;

  return (
    <>
      {/* Visual backdrop — hidden from assistive technology */}
      <div
        className="fixed inset-0 bg-black/50 z-[99] animate-[overlayFadeIn_260ms_ease_both]"
        aria-hidden="true"
      />
      {/* Dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`fixed inset-x-0 bottom-0 z-100 bg-card rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto animate-[sheetSlideUp_260ms_cubic-bezier(0,0,0.2,1)_both] motion-reduce:animate-none ${className ?? ""}`}
      >
        {/* Visually hidden title for screen readers when heading is not rendered */}
        <span id={titleId} className="sr-only">
          {title}
        </span>
        {children}
      </div>
    </>
  );
}
