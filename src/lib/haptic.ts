/**
 * Haptic feedback utility — wraps the Web Vibration API.
 *
 * Functional on Android Chrome/Firefox/Edge. Silently no-ops on iOS Safari
 * (which deliberately doesn't expose `navigator.vibrate`) and on desktop browsers.
 *
 * Respects `prefers-reduced-motion` for consistency with the rest of the a11y layer.
 */

const PATTERNS = {
  /** Single short pulse — for taps, increments, decrements */
  tap: 8,
  /** Single medium pulse — for confirmation of an additive action (add to cart) */
  success: 12,
  /** Double pulse — for limit-exceeded states */
  warning: [10, 60, 10],
  /** Triple pulse — for blocked or error actions */
  error: [20, 60, 20, 60, 20],
} as const;

export type HapticPattern = keyof typeof PATTERNS;

export function haptic(pattern: HapticPattern = "tap"): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  try {
    const p = PATTERNS[pattern];
    // Spread tuple to a mutable array — VibratePattern doesn't accept readonly arrays
    navigator.vibrate(typeof p === "number" ? p : [...p]);
  } catch {
    // Some browsers throw if vibrate is disabled by site permissions — silently ignore
  }
}
