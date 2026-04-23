# Phase 3: Price Optimization — Research

**Researched:** 2026-04-23
**Domain:** Budget persistence (Supabase), recommendation scoring, Next.js profile subpage pattern, session-local React state
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Budget is exposed in two places: a new `/perfil/presupuesto` subpage (persistent) AND an inline input on the carrito page (session-only override). Follows the same established navigation pattern as `/perfil/editar-metas` and `/perfil/condiciones`.

**D-02:** The `/perfil/presupuesto` page persists `max_budget` to Supabase `profiles` table via `UPDATE`. New numeric input field with a save button — follows `editar-metas` pattern exactly.

**D-03:** The carrito inline input is session-only — changes do NOT write back to Supabase. Pre-filled with the profile budget (`useGoalsStore.budget`) on mount. Resets on page leave.

**D-04:** Session budget lives in local React state on the carrito page component (not in cart-store and not in useGoalsStore). Passed to `recommend()` as `maxBudget` arg. Unmount clears it.

**D-05:** `max_budget numeric` added to `profiles` table via `ALTER TABLE profiles ADD COLUMN max_budget numeric`. NULL = no budget (optimization disabled). Additive migration only.

**D-06:** `useGoalsStore` gains `budget: number | null`. `fetchGoals()` adds a third `Promise.allSettled` query for `profiles.max_budget`. NULL from DB → null in store.

**D-07:** `recommend()` signature extended to: `recommend(products, totals, goals, limit, restrictions, maxBudget?: number)`. 6th param optional, `undefined` = budget mode off.

**D-08:** When `maxBudget` is defined, two steps apply in sequence:
1. Hard filter: Remove products where `product.price > (maxBudget - totals.price)`.
2. Blend score: `score = (protein*proteinGap + carbs*carbsGap + fat*fatGap) * (1 - product.price / maxBudget)`.

**D-09:** When `maxBudget` is `undefined` or `null`, existing scoring logic is completely unchanged.

**D-10:** Only the top-1 ranked product gets the badge. Applies only when `maxBudget` is active.

**D-11:** The badge replaces the `reason` line on the card. `RecommendedProduct.reason` is set to `"Mejor relación proteína/precio"` for the top-1 item when budget mode is active. No new type field needed.

**D-12:** Badge signal flows through `reason` string. The card component does not need to know about budget mode. When `reason === "Mejor relación proteína/precio"`, the card applies `bg-accent text-white` banner styling.

**D-13:** `useGoalsStore` is extended (not split) with `budget: number | null`. `fetchGoals()` follows the same `Promise.allSettled` + `finally` pattern established in Phase 2.

**D-14:** Carrito session budget is NOT persisted in cart-store or Zustand. Plain `useState` on the carrito client component, initialized from `useGoalsStore().budget`.

### Claude's Discretion

- Exact styling of the badge/reason line when `reason === "Mejor relación proteína/precio"` (icon, color, emphasis) — resolved in UI-SPEC: `bg-accent text-white` banner on existing `badge` prop
- Loading and save feedback on `/perfil/presupuesto` page (spinner, toast, optimistic update) — resolved in UI-SPEC: text-change only, toast on error required, toast on success optional
- Empty state when remaining-budget filter removes all products — resolved in UI-SPEC: reuse `EmptyState` with budget-specific copy
- RLS policy for `profiles.max_budget` update — existing `profiles update own` policy already covers all `profiles` columns
- Whether to show the current budget amount as a progress indicator in the carrito — resolved in UI-SPEC: YES, `$X,XXX disponibles de $Y,YYY total` strip below input

### Deferred Ideas (OUT OF SCOPE)

None raised during Phase 3 discussion — conversation stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PRICE-01 | User can set a max purchase budget from profile or cart | Confirmed via editar-metas pattern + UI-SPEC: `/perfil/presupuesto` page + carrito inline widget |
| PRICE-02 | Budget persists in Supabase on user profile | Confirmed: `ALTER TABLE profiles ADD COLUMN max_budget numeric` — additive migration following 005_dietary_tags.sql pattern |
| PRICE-03 | `recommend()` accepts optional `maxBudget: number` and filters products exceeding remaining budget | Confirmed: current signature ends at `restrictions: string[]`; 6th param slot is open and the comment already documents Phase 3 extension |
| PRICE-04 | Recommendation score includes price efficiency component when `maxBudget` is defined | Confirmed: blend formula `macroScore * (1 - price/maxBudget)` applied after hard filter |
| PRICE-05 | Recommendation card shows "Mejor relación proteína/precio" indicator on top-scored product | Confirmed: delivered through existing `reason` field + `badge` prop on `ProductCard` — no new type fields needed |
</phase_requirements>

---

## Summary

Phase 3 extends three surfaces that already have established patterns from Phases 1 and 2: the recommendation engine, the goals store, and the profile subpage system. Every touch point has a direct template to follow. The primary engineering work is additive — one new SQL migration, one new store field, one new signature parameter, one new profile subpage, and two UI modifications.

The recommendation engine currently implements `recommend(products, totals, goals, limit, restrictions)` with 5 parameters. The comment at line 67 already documents the Phase 3 extension. Adding `maxBudget?` as the 6th parameter and inserting a conditional filter + score-blend block before the `.sort()` call is the entire engine change. The existing test file (`recommendation-engine.test.ts`) follows a `makeProduct()` helper pattern that maps cleanly to budget test cases.

The goals store currently runs two parallel Supabase queries in `fetchGoals()` via `Promise.allSettled`. Adding a third query for `profiles.max_budget` follows exactly the same pattern already present for `dietary_restrictions`. The `budget: number | null` field is stored alongside `goals` and `restrictions` — no new store or middleware needed.

**Primary recommendation:** Follow the Phase 2 patterns exactly. Each new piece has a working reference: editar-metas for the profile page, condiciones for auto-save / toast feedback, goals-store for the third `Promise.allSettled` leg, and the recommendation-engine test for the new unit tests.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Budget persistence (PRICE-02) | Database / Supabase | API (via Supabase client SDK) | `profiles.max_budget` is user data; RLS enforces row-level access |
| Budget entry — persistent (PRICE-01 profile) | Frontend Server (SSR) + Client | Database | Server component fetches initial `max_budget`; client component handles form state and `UPDATE` |
| Budget entry — session override (PRICE-01 carrito) | Browser / Client | — | Pure `useState` on `carrito/page.tsx`; never written to DB |
| Recommendation filter + scoring (PRICE-03, PRICE-04) | Browser / Client (domain layer) | — | `recommend()` is a pure function in `src/domain/`; runs client-side wherever called |
| Price-efficiency badge (PRICE-05) | Browser / Client | — | `reason` string set by `recommend()`; rendered by existing `ProductCard` `badge` prop |
| Budget load into store (PRICE-02 read path) | Browser / Client (Zustand store) | Database | `useGoalsStore.fetchGoals()` loads `max_budget`; runs once per session via `GoalsLoader` |

---

## Standard Stack

### Core (verified from codebase)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | App router, server components, client components | Project baseline [VERIFIED: package.json] |
| Supabase JS | ^2.103.0 | Supabase client, auth, DB queries | Project baseline [VERIFIED: package.json] |
| @supabase/ssr | ^0.10.2 | Server-side Supabase client for RSC data fetching | Project baseline; used in all profile server pages [VERIFIED: package.json] |
| Zustand | ^5.0.12 | Client-side state (goals, restrictions, budget) | Project baseline; `useGoalsStore` established in Phase 2 [VERIFIED: package.json] |
| lucide-react | ^1.8.0 | Icons (`Wallet`, `ArrowLeft`, `AlertCircle`) | Project baseline [VERIFIED: package.json] |

### No New Libraries Needed
All Phase 3 requirements are implemented with the existing stack. No new npm dependencies.

---

## Architecture Patterns

### System Architecture Diagram

```
User sets budget (/perfil/presupuesto)
  ↓
[Server Component: page.tsx]
  → supabase server client → SELECT profiles.max_budget
  → pass initialBudget prop
  ↓
[Client Component: presupuesto-client.tsx]
  → useState(initialBudget)
  → onChange: local state only
  → onSave: supabase client UPDATE profiles SET max_budget=X
  → router.push("/perfil") + router.refresh()

GoalsLoader (runs once per session in layout)
  ↓
[useGoalsStore.fetchGoals()]
  → Promise.allSettled([
      macro_goals query,        ← existing
      profiles.dietary_restrictions,  ← Phase 2
      profiles.max_budget       ← Phase 3 NEW
    ])
  → set({ budget: max_budget ?? null })

InicioClient renders recommendations
  ↓
recommend(allProducts, totals, goals, 6, restrictions, budget ?? undefined)
  → if maxBudget defined:
      1. filter: product.price <= (maxBudget - totals.price)
      2. score: macroScore * (1 - product.price / maxBudget)
  → sort descending, slice(0, limit)
  → top-1: set reason = "Mejor relación proteína/precio"
  ↓
ProductCard renders badge prop
  → if reason === "Mejor relación proteína/precio": bg-accent banner
  → else: BADGE_BY_CATEGORY fallback

CarritoPage (session override)
  ↓
useState<number|null>(() => useGoalsStore.getState().budget)
  → sessionBudget: user can edit inline
  → passed to recommend() as 6th arg: sessionBudget > 0 ? sessionBudget : undefined
  → indicator strip: "$X disponibles de $Y total"
  → component unmount: state gone (no persistence)
```

### Recommended Project Structure (new files only)

```
src/
├── app/(app)/perfil/presupuesto/
│   ├── page.tsx                # Server component — fetches initial max_budget
│   └── presupuesto-client.tsx  # Client component — form + save
├── supabase/migrations/
│   └── 006_budget.sql          # ALTER TABLE profiles ADD COLUMN max_budget numeric
src/
├── stores/goals-store.ts       # [modified] add budget field + third allSettled query
├── domain/recommendation/recommendation-engine.ts  # [modified] add maxBudget? param
├── app/(app)/perfil/perfil-client.tsx  # [modified] add Presupuesto menu item
├── app/(app)/carrito/page.tsx  # [modified] add session budget useState + widget
├── app/(app)/inicio/inicio-client.tsx  # [modified] pass budget to recommend()
```

### Pattern 1: Profile Subpage (Server + Client split)

**What:** Server component (`page.tsx`) fetches initial data with Supabase server client. Passes to a client component that owns form state and handles the save mutation.

**When to use:** Any profile setting that needs initial data from DB AND user editing.

**Reference implementation:** `src/app/(app)/perfil/editar-metas/page.tsx`

```typescript
// Source: src/app/(app)/perfil/editar-metas/page.tsx (verified — full client, no server split)
// NOTE: editar-metas is a pure client component that loads data in useEffect.
// For presupuesto, the UI-SPEC prescribes the same pattern (client-only, useEffect load).
// A server component shell with initial prop is ALSO acceptable; both approaches work.
// The simpler approach (client-only like editar-metas) avoids an extra file.
"use client";
export default function EditarMetasPage() {
  const [protein, setProtein] = useState(150);
  useEffect(() => {
    // load from supabase
  }, []);
  const handleSave = async () => {
    // UPDATE + router.push("/perfil")
  };
}
```

**Key implementation note:** `editar-metas/page.tsx` is actually a pure client component (uses `useEffect` to load initial data). The CONTEXT.md server-component description was aspirational; both approaches are valid. The simpler path is client-only (matches editar-metas exactly). The UI-SPEC also describes this as a client component with `useState` + `useEffect` load. **Follow editar-metas exactly: one file, `"use client"`, `useEffect` load, `handleSave` with `router.push`.**

### Pattern 2: `Promise.allSettled` Query Extension in Goals Store

**What:** Adding a third parallel Supabase query to `fetchGoals()` alongside the existing macro_goals and dietary_restrictions queries.

**When to use:** Any new user profile field that should load at session start alongside goals.

**Reference:** `src/stores/goals-store.ts` lines 30–54

```typescript
// Source: src/stores/goals-store.ts (verified — current implementation)
const [goalsResult, profileResult] = await Promise.allSettled([
  supabase.from("macro_goals").select("*").eq("user_id", user.id).single(),
  supabase.from("profiles").select("dietary_restrictions").eq("id", user.id).single(),
]);
// Phase 3 adds:
// supabase.from("profiles").select("max_budget").eq("id", user.id).single()
// IMPORTANT: combine into ONE profiles query to avoid a second round-trip:
// supabase.from("profiles").select("dietary_restrictions, max_budget").eq("id", user.id).single()
```

**Critical optimization:** The existing code makes one `profiles` query for `dietary_restrictions`. Phase 3 adds `max_budget` to the SAME `profiles` row. Rather than adding a third `Promise.allSettled` leg, extend the existing `profileResult` query to `select("dietary_restrictions, max_budget")` and extract both fields from one result. This is more efficient and simpler than adding a third leg. Update the store state destructuring accordingly.

### Pattern 3: `recommend()` Parameter Extension

**What:** Adding an optional `maxBudget?: number` parameter as the 6th argument. When defined, applies a pre-filter then a blend score multiplier.

**When to use:** Budget mode. `undefined` = no change to existing behavior.

**Reference:** `src/domain/recommendation/recommendation-engine.ts` (current file, lines 64–89)

```typescript
// Source: verified from src/domain/recommendation/recommendation-engine.ts
export const recommend = (
  products: readonly Product[],
  totals: CartTotals,
  goals: MacroGoals,
  limit = 6,
  restrictions: string[] = [],
  maxBudget?: number,  // Phase 3 — undefined = budget mode off (D-09)
): RecommendedProduct[] => {
  // Step 1: existing restrictions filter (unchanged)
  const compatible = restrictions.length === 0
    ? products
    : products.filter((p) => restrictions.every((r) => p.dietaryTags.includes(r)));

  // Step 2: budget hard filter (Phase 3, only when maxBudget is defined)
  const budgetFiltered = maxBudget !== undefined
    ? compatible.filter((p) => p.price <= (maxBudget - totals.price))
    : compatible;

  const dominant = findBiggestGap(totals, goals);
  const reason = dominant.gap > 0.1 ? REASON_BY_MACRO[dominant.macro] : "Recomendado para ti";

  // Step 3: score with optional price-blend
  const scored = [...budgetFiltered].map((p) => {
    const macroScore = scoreProduct(p, totals, goals);
    const score = maxBudget !== undefined
      ? macroScore * (1 - p.price / maxBudget)  // D-08 blend formula
      : macroScore;
    return { ...p, reason, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score).slice(0, limit);

  // Step 4: badge top-1 when budget is active (D-10, D-11)
  if (maxBudget !== undefined && sorted.length > 0) {
    sorted[0] = { ...sorted[0], reason: "Mejor relación proteína/precio" };
  }

  return sorted;
};
```

### Pattern 4: Session-Only State with Store Pre-fill

**What:** `useState` initialized once from Zustand store using `getState()` (not `useStore()` selector) to avoid re-renders on store changes.

**When to use:** Any session-local value that should default to the persisted user preference but be independently overridable.

```typescript
// Source: CONTEXT.md specifics section (D-14, verified against D-04)
const [sessionBudget, setSessionBudget] = useState<number | null>(
  () => useGoalsStore.getState().budget  // reads once on mount
);
// Pass to recommend():
const effectiveBudget = sessionBudget && sessionBudget > 0 ? sessionBudget : undefined;
const recommended = recommend(allProducts, totals, goals, 6, restrictions, effectiveBudget);
```

### Anti-Patterns to Avoid

- **Third `Promise.allSettled` leg for `max_budget`:** Don't add a third independent query. Combine `dietary_restrictions` and `max_budget` into one `profiles` select — one round-trip is cheaper than two.
- **Persisting session budget in cart-store:** D-14 explicitly forbids this. Session budget lives only in component state.
- **Applying blend score before the hard filter:** The hard filter removes products that don't fit the remaining budget. Score only survivors — otherwise a product that costs more than the remaining budget could rank first.
- **Setting `reason = "Mejor relación proteína/precio"` before slicing to `limit`:** The badge applies to top-1 of the final result. Mutate after `.slice(0, limit)`.
- **Dividing by `maxBudget` when `maxBudget === 0`:** Guard: only activate budget mode when `maxBudget > 0`. The UI-SPEC documents `0` as "no budget" — treat same as `undefined`.
- **Two separate `profiles` UPDATE calls from `PresupuestoClient`:** Profile row always exists (created by `handle_new_user()` trigger). Use `UPDATE profiles SET max_budget=X WHERE id=user.id` — not `upsert`. (Same as dietary_restrictions update pattern in condiciones.)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Numeric currency input formatting | Custom format/parse logic | Native `type="number"` with `inputMode="numeric"` | Sufficient for integers (COP pesos); avoids locale parsing bugs |
| Row-level security for `max_budget` | Custom auth checks in client code | Existing `"profiles update own"` RLS policy in `002_rls_policies.sql` | Policy covers all `profiles` columns — `max_budget` is automatically protected |
| Loading state management in form | Custom useReducer state machine | `useState<boolean>` for `loading` | Same pattern used in editar-metas; two states (loading/idle) don't need a reducer |
| Toast notifications | Custom toast system | `useToastStore` already in project | `useToastStore.getState().add(msg, type)` — same pattern as condiciones |

**Key insight:** Every problem this phase introduces already has a project-established solution. The research confirms zero new library dependencies.

---

## Common Pitfalls

### Pitfall 1: Adding a Third `profiles` Query Instead of Extending the Existing One

**What goes wrong:** Developer adds `supabase.from("profiles").select("max_budget")` as a third leg in `Promise.allSettled`, making two separate round-trips to the same `profiles` table.
**Why it happens:** Phase 2 established a pattern of adding new legs. But `max_budget` is in the same `profiles` row as `dietary_restrictions`.
**How to avoid:** Change the Phase 2 profiles query from `select("dietary_restrictions")` to `select("dietary_restrictions, max_budget")`. Extract both fields from the single result.
**Warning signs:** If `profileResult` destructuring has two separate variables for the same table, this pitfall was hit.

### Pitfall 2: Division by Zero in Blend Score

**What goes wrong:** `(1 - product.price / maxBudget)` throws NaN or Infinity when `maxBudget === 0`.
**Why it happens:** UI allows user to enter 0 (meaning "no budget"), but code might pass 0 to `recommend()`.
**How to avoid:** In all call sites, convert `budget === 0` to `undefined`: `budget && budget > 0 ? budget : undefined`. The `recommend()` function itself should also guard: `if (!maxBudget || maxBudget <= 0) return existing logic`.
**Warning signs:** NaN scores causing unpredictable sort order on the recommendations grid.

### Pitfall 3: Blend Score Applied to Products That Failed the Hard Filter

**What goes wrong:** Products with `price > remainingBudget` still appear in results (just ranked lower due to the price penalty).
**Why it happens:** Implementing the blend without implementing the hard filter first.
**How to avoid:** Two distinct steps in sequence: (1) filter array, (2) map to scores. The filter step removes products entirely — the score step never sees them.
**Warning signs:** In budget mode with a very tight budget, `recommend()` still returns products priced above the remaining budget.

### Pitfall 4: `reason` Mutation Before `.slice()`

**What goes wrong:** The "Mejor relación proteína/precio" badge appears on the wrong product (not necessarily the top-1 of the final rendered list).
**Why it happens:** Setting `reason` on `sorted[0]` before slicing, or setting it on the highest-scored product before sorting.
**How to avoid:** The mutation order is: score all → sort descending → slice(0, limit) → mutate result[0].reason. Mutation is the last step.
**Warning signs:** In a list of 6 recommendations, the badge appears on product #2 or #3.

### Pitfall 5: Session Budget Re-Syncing from Store on Store Changes

**What goes wrong:** User overrides the session budget (e.g., sets it to $50,000 temporarily), then `useGoalsStore` re-fetches and overwrites the local state.
**Why it happens:** Using `useGoalsStore((s) => s.budget)` as the initializer causes the `useState` to re-sync on store updates.
**How to avoid:** Initialize with `useGoalsStore.getState().budget` (reads once synchronously at mount), NOT with a selector. The `useState` lazy initializer `() => useGoalsStore.getState().budget` runs only on mount.
**Warning signs:** User types a session budget override but it resets to profile value after a few seconds.

### Pitfall 6: RLS Policy Scope for `max_budget`

**What goes wrong:** Developer adds a new explicit RLS policy for `max_budget` update, which conflicts with or duplicates the existing `profiles update own` policy.
**Why it happens:** Misunderstanding that RLS policies on a table apply to all columns, not individual columns.
**How to avoid:** Do not add any new RLS policy. The existing `"profiles update own"` policy (`for update using (auth.uid() = id)`) already allows updating any column on `profiles` where `auth.uid() = id`. Confirm this in `002_rls_policies.sql` line 11.
**Warning signs:** Supabase returns a 403 or RLS error on the `max_budget` UPDATE — indicates something else is wrong (not missing policy but wrong `id` value or missing auth).

### Pitfall 7: `goals-store.test.ts` Mock Needs Updating

**What goes wrong:** Existing `goals-store.test.ts` mocks the `profiles` query to return `{ dietary_restrictions: [...] }`. After extending the query to `select("dietary_restrictions, max_budget")`, the mock still returns an object without `max_budget`, causing `budget` to be `undefined` instead of `null`.
**Why it happens:** Test mocks return hardcoded objects; they don't auto-expand when the query field list changes.
**How to avoid:** When extending the profiles select query, also update the mock in `goals-store.test.ts` to return `{ dietary_restrictions: [...], max_budget: null }` (or a test value).
**Warning signs:** `useGoalsStore.budget` is `undefined` in tests instead of `null`.

---

## Code Examples

### Migration File Pattern

```sql
-- Source: verified from supabase/migrations/005_dietary_tags.sql
-- 006_budget.sql — Phase 3 (PRICE-02)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS max_budget numeric;
-- No DEFAULT — NULL means "no budget set" (D-05)
-- No NOT NULL constraint — NULL is valid and meaningful
-- No CHECK constraint — any non-negative value is valid (enforced in UI)
```

### `useGoalsStore` Extension (combined profiles query)

```typescript
// Source: derived from src/stores/goals-store.ts (verified current implementation)
// Change: extend profileResult select to include max_budget
type GoalsState = {
  goals: MacroGoals;
  restrictions: string[];
  budget: number | null;  // Phase 3 (PRICE-02) — null = no budget active
  loading: boolean;
  fetchGoals: () => Promise<void>;
};

// In fetchGoals(), change the profiles query:
supabase
  .from("profiles")
  .select("dietary_restrictions, max_budget")  // extended
  .eq("id", user.id)
  .single()

// In the result handler:
set({
  restrictions: profileResult.status === "fulfilled"
    ? (profileResult.value.data?.dietary_restrictions ?? [])
    : [],
  budget: profileResult.status === "fulfilled"
    ? (profileResult.value.data?.max_budget ?? null)
    : null,
});
```

### `recommend()` Call Sites

```typescript
// Source: derived from src/app/(app)/inicio/inicio-client.tsx line 50 (verified)
// inicio-client.tsx — uses profile budget (from store), no session override
const { budget } = useGoalsStore();
const recommended = recommend(
  allProducts, totals, goals, 6, restrictions,
  budget && budget > 0 ? budget : undefined
);

// carrito/page.tsx — uses session budget (local state), pre-filled from store
const [sessionBudget, setSessionBudget] = useState<number | null>(
  () => useGoalsStore.getState().budget
);
const recommended = recommend(
  allProducts, totals, goals, 6, restrictions,
  sessionBudget && sessionBudget > 0 ? sessionBudget : undefined
);
```

### `PresupuestoClient` Save Pattern

```typescript
// Source: derived from src/app/(app)/perfil/editar-metas/page.tsx (verified pattern)
const handleSave = async () => {
  setLoading(true);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { setLoading(false); return; }

  const valueToSave = budget && budget > 0 ? budget : null; // 0 → null (no budget)
  const { error } = await supabase
    .from("profiles")
    .update({ max_budget: valueToSave })
    .eq("id", user.id);

  setLoading(false);
  if (error) {
    useToastStore.getState().add("No se pudo guardar. Intenta de nuevo.", "error");
    return;
  }
  // Optionally: useToastStore.getState().add("Presupuesto guardado", "success");
  useGoalsStore.setState({ budget: valueToSave }); // sync store without refetch
  router.push("/perfil");
  router.refresh();
};
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/__tests__/recommendation-engine.test.ts src/__tests__/goals-store.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRICE-02 | `fetchGoals()` loads `budget` from `profiles.max_budget`; NULL → null in store | unit | `npx vitest run src/__tests__/goals-store.test.ts` | ✅ (needs new test cases) |
| PRICE-03 | `recommend()` hard-filters products where `price > (maxBudget - totals.price)` | unit | `npx vitest run src/__tests__/recommendation-engine.test.ts` | ✅ (needs new test cases) |
| PRICE-04 | `recommend()` blend score = `macroScore * (1 - price/maxBudget)`; cheaper similar products rank higher | unit | `npx vitest run src/__tests__/recommendation-engine.test.ts` | ✅ (needs new test cases) |
| PRICE-05 | Top-1 product gets `reason = "Mejor relación proteína/precio"` when budget active | unit | `npx vitest run src/__tests__/recommendation-engine.test.ts` | ✅ (needs new test cases) |
| PRICE-01 | Budget UI renders and saves (profile + carrito) | manual | — | manual-only (no component test infrastructure) |

Note: PRICE-01 UI is manual-only — the project has no React Testing Library integration tests (only pure domain + store unit tests). The existing `setup.ts` configures jsdom but no component test patterns exist. Do not add component tests in this phase.

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/recommendation-engine.test.ts src/__tests__/goals-store.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (currently 52 tests passing) before `/gsd-verify-work`

### Wave 0 Gaps

New test cases needed in existing files (NOT new files):

- [ ] `src/__tests__/recommendation-engine.test.ts` — add `describe("recommend() — PRICE-03/04/05 budget mode")` block with:
  - hard filter: products above remaining budget are excluded
  - blend score: cheaper product with similar macros ranks above pricier one
  - budget inactive (`undefined`): scores identical to non-budget call
  - top-1 badge: `result[0].reason === "Mejor relación proteína/precio"` when budget active
  - empty result: when all products exceed remaining budget
  - `maxBudget = 0` treated as undefined (guard case)

- [ ] `src/__tests__/goals-store.test.ts` — update Supabase mock to return `{ dietary_restrictions: [...], max_budget: 80000 }` from profiles; add test: `fetchGoals() populates budget from profiles query (PRICE-02)`

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — no new auth flows |
| V3 Session Management | no | N/A — session budget is in-memory only, no session tokens |
| V4 Access Control | yes | Existing `profiles update own` RLS policy covers `max_budget` column |
| V5 Input Validation | yes | `budget > 0` guard before passing to `recommend()`; `UPDATE` only with authenticated user |
| V6 Cryptography | no | N/A — no new secrets |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Updating another user's `max_budget` via Supabase client | Tampering | RLS `profiles update own` policy: `using (auth.uid() = id)` — already in `002_rls_policies.sql` |
| `maxBudget = 0` → division by zero in blend formula | Tampering / Denial | Guard: treat `maxBudget <= 0` as `undefined` in `recommend()` and at all call sites |
| Negative budget value submitted | Tampering | UI uses `type="number" min="0"`; server-side `UPDATE` writes whatever value is sent — add `max(0, budget)` clamp or validate before update |

**Negative budget note:** The `profiles` table has no `CHECK` constraint on `max_budget` (it's `numeric` with no bounds). A negative value could cause the blend factor `(1 - price/maxBudget)` to exceed 1, breaking score normalization. Clamp to `null` on save when `budget <= 0` (already in the save pattern above — `const valueToSave = budget && budget > 0 ? budget : null`).

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is code/config/SQL changes only. No external CLIs, services, or runtimes beyond the project's existing stack (Node.js, Supabase). All verified present from Phase 1/2 execution.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `editar-metas/page.tsx` is a client-only component (no server shell) — presupuesto page should match this exactly | Architecture Patterns / Pattern 1 | If the codebase later adds a server component shell to editar-metas, the split pattern becomes preferred |
| A2 | Extending the existing `profiles` SELECT to include both `dietary_restrictions` and `max_budget` is valid Supabase syntax and returns both fields in one row | Standard Stack / Pattern 2 | Extremely low risk — standard SQL multi-column select |

All other claims are VERIFIED directly from codebase files read in this session.

---

## Open Questions

1. **`carrito/page.tsx` does not currently call `recommend()` — it only renders items already in the cart**
   - What we know: The current `carrito/page.tsx` (verified) has no `recommend()` call and no `allProducts` prop. It only renders `items` from `useCart`.
   - What's unclear: The CONTEXT.md says "carrito-client.tsx (or equivalent): `useState<number | null>` initialized from `useGoalsStore().budget`; passed to `recommend()` in the carrito context." But there is no recommendations section visible in the carrito page.
   - Recommendation: The session budget widget should be added to `carrito/page.tsx` for display and user input, but the `recommend()` call with session budget may feed the `inicio` page (not carrito itself). The most accurate reading of CONTEXT.md is that carrito has the *input* widget; `inicio` uses the *profile* budget from store directly. The session override would only matter if a future "recommendations in carrito" section is added. **For this phase: add the session budget widget to carrito for input; pass session budget to `recommend()` if a recommendations section exists or is added in carrito. If not, the widget is still useful as a display/override entry point.**
   - Impact: Low — the budget widget and `useState` are added to carrito regardless; the `recommend()` call site question only matters if carrito renders recommendations.

### Open Questions (RESOLVED)

**Resolution date:** 2026-04-23 (plan revision after checker feedback)

1. **How does carrito's session budget reach `recommend()` on the inicio page?**
   - **Resolved:** A non-persisted Zustand slice (`src/stores/session-budget-store.ts`) bridges the two components.
   - **Approach:** `carrito/page.tsx` writes `sessionBudget` into `useSessionBudgetStore` via a `useEffect` on every local state change, and clears it back to `null` via `useEffect` cleanup on unmount. `inicio-client.tsx` reads `useSessionBudgetStore().budget ?? useGoalsStore().budget` — session override takes priority, falls back to the profile budget from `useGoalsStore`. This value is then passed to `recommend()` as the `maxBudget` arg (with the `> 0` guard).
   - **Store spec:** `create<{ budget: number | null }>(() => ({ budget: null }))` — no persist middleware, pure in-memory, clears on full page reload automatically.
   - **Why not useState-only:** Local component state in carrito is invisible to inicio. The session store is the minimal cross-component bridge that satisfies D-04 without adding persistence.

---

## Sources

### Primary (HIGH confidence)
- `src/domain/recommendation/recommendation-engine.ts` — current `recommend()` signature and scoring implementation (read in this session)
- `src/stores/goals-store.ts` — current `useGoalsStore` with `Promise.allSettled` pattern (read in this session)
- `src/app/(app)/perfil/editar-metas/page.tsx` — reference implementation for profile subpage (read in this session)
- `src/app/(app)/perfil/condiciones/page.tsx` — reference implementation for profile subpage with auto-save + toast (read in this session)
- `src/app/(app)/perfil/perfil-client.tsx` — menu structure for adding "Presupuesto" item (read in this session)
- `src/app/(app)/carrito/page.tsx` — current carrito structure for adding session budget widget (read in this session)
- `src/app/(app)/inicio/inicio-client.tsx` — current `recommend()` call site (read in this session)
- `src/components/ui/empty-state.tsx` — component interface for budget-exhausted empty state (read in this session)
- `supabase/migrations/001_init_schema.sql` — `profiles` table definition (read in this session)
- `supabase/migrations/002_rls_policies.sql` — RLS policies including `profiles update own` (read in this session)
- `supabase/migrations/005_dietary_tags.sql` — migration pattern for additive ALTER TABLE (read in this session)
- `src/__tests__/recommendation-engine.test.ts` — existing test patterns and `makeProduct` helper (read in this session)
- `src/__tests__/goals-store.test.ts` — existing store test patterns and mock structure (read in this session)
- `.planning/phases/03-price-optimization/03-CONTEXT.md` — all locked decisions D-01 through D-14 (read in this session)
- `.planning/phases/03-price-optimization/03-UI-SPEC.md` — approved UI contract (read in this session)
- `package.json` — verified library versions (read in this session)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all libraries verified from package.json
- Architecture: HIGH — all patterns derived from existing verified codebase files
- Pitfalls: HIGH — identified from code inspection and CONTEXT.md decisions
- Test patterns: HIGH — verified from existing test files

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (stable stack, no external dependencies)
