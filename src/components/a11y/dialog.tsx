"use client";

import { useRef, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/a11y/use-focus-trap";
import { useEscapeKey } from "@/hooks/a11y/use-escape-key";
import { useReturnFocus } from "@/hooks/a11y/use-return-focus";
import { cn } from "@/lib/cn";

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

  // Portal to body so the Dialog escapes any transformed/animated ancestor that
  // would otherwise become its containing block (iOS Safari `position: fixed`
  // gets trapped inside transform ancestors — clips bottom against parent's box,
  // not the viewport).
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Visual backdrop — hidden from assistive technology */}
      <div
        className="fixed inset-0 bg-black/50 z-[99] animate-[overlayFadeIn_260ms_ease_both]"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // Caller's className first, base classes last — base wins on Tailwind conflicts
        // (e.g. "fixed" must override any "relative" the caller passes)
        className={cn(
          className,
          "fixed inset-x-0 bottom-0 z-[100] bg-card rounded-t-3xl p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] max-h-[calc(100dvh-2rem)] overflow-y-auto animate-[sheetSlideUp_260ms_cubic-bezier(0,0,0.2,1)_both] motion-reduce:animate-none"
        )}
      >
        {/* Visually hidden title for screen readers when heading is not rendered */}
        <span id={titleId} className="sr-only">
          {title}
        </span>
        {children}
      </div>
    </>,
    document.body,
  );
}
