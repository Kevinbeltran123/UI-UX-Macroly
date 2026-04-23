---
phase: 03-price-optimization
plan: "03"
subsystem: ui-budget-wiring
tags: [budget, session-store, recommendations, carrito, inicio, zustand]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [session-budget-store, budget-wired-inicio, carrito-budget-widget]
  affects: [inicio-client.tsx, carrito/page.tsx]
tech_stack:
  added: [session-budget-store (non-persisted Zustand slice)]
  patterns: [session-override-with-profile-fallback, read-once-getState, useEffect-sync-with-cleanup]
key_files:
  created:
    - src/stores/session-budget-store.ts
  modified:
    - src/app/(app)/inicio/inicio-client.tsx
    - src/app/(app)/carrito/page.tsx
decisions:
  - "Session budget initialized from useGoalsStore.getState().budget (read-once, not selector) to avoid re-sync loop (Pitfall 5)"
  - "Session override takes priority over profile budget: sessionBudget ?? profileBudget (D-04)"
  - "Budget 0 and null both map to undefined in recommend() call site (T-3-02 guard)"
  - "EmptyState has three branches: budget+restrictions, budget-only, restrictions-only — Phase 2 copy preserved"
  - "Badge prop checks p.reason directly before BADGE_BY_CATEGORY lookup (D-12)"
  - "useSessionBudgetStore cleared to null on carrito unmount via useEffect cleanup (D-04)"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-23T15:04:23Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 03 Plan 03: Session Budget Store + UI Wiring Summary

**One-liner:** Non-persisted session-budget Zustand slice bridges carrito's local state to inicio's recommend() call with badge, three-branch empty state, and remaining-budget indicator.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Push database schema (human-action, pre-completed) | — | supabase migration applied |
| 2 | Create session-budget-store + wire budget into inicio-client.tsx | 47a60fa | src/stores/session-budget-store.ts, src/app/(app)/inicio/inicio-client.tsx |
| 3 | Add session budget widget to carrito/page.tsx | b64c8e8 | src/app/(app)/carrito/page.tsx |

## What Was Built

### session-budget-store.ts (NEW)
Non-persisted Zustand slice (`budget: number | null`, no persist middleware). Purely in-memory — clears on full page reload and on carrito unmount.

### inicio-client.tsx (UPDATED)
- Reads `sessionBudget ?? profileBudget` — session override with profile fallback (D-04)
- Passes `budget && budget > 0 ? budget : undefined` as 6th arg to `recommend()` (T-3-02 guard)
- Badge prop: checks `p.reason === "Mejor relación proteína/precio"` first, falls back to BADGE_BY_CATEGORY (D-12)
- Three-branch EmptyState: budget+restrictions combined, budget-only ("Ningún producto cabe..."), restrictions-only (Phase 2 copy preserved)
- Imports `Wallet` from lucide-react for budget empty state icon

### carrito/page.tsx (UPDATED)
- `sessionBudget` initialized via `useGoalsStore.getState().budget` (read-once, no store subscription — Pitfall 5)
- `useEffect` syncs `sessionBudget` to `useSessionBudgetStore` on every change
- `useEffect` cleanup clears store to `null` on unmount (D-04)
- Session budget input widget: Wallet icon, "Presupuesto de sesión" label, "Sin límite" placeholder, `inputMode="numeric"`
- Remaining-budget indicator: `bg-primary-light border-primary-border` when positive; `bg-error/10 border-error/20` when exhausted; `role="status"` for accessibility

## Deviations from Plan

None — plan executed exactly as written. Task 1 (human-action checkpoint) was pre-completed by user.

## Known Stubs

None — all data is wired from live stores.

## Threat Flags

No new security surface introduced beyond what was documented in the plan threat model (T-3-01 through T-3-06). Session budget input is never written to DB (D-14).

## Self-Check: PASSED

Files exist:
- src/stores/session-budget-store.ts — FOUND
- src/app/(app)/inicio/inicio-client.tsx — FOUND (modified)
- src/app/(app)/carrito/page.tsx — FOUND (modified)

Commits exist:
- 47a60fa — FOUND (feat(03-03): create session-budget-store + wire budget into inicio-client)
- b64c8e8 — FOUND (feat(03-03): add session budget widget to carrito with store sync + unmount cleanup)

Verification:
- npx tsc --noEmit — exits 0
- npx vitest run — 172 tests passing (21 test files)
