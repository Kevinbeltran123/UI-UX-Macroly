---
phase: 04-4
reviewed: 2026-04-23T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - supabase/migrations/007_meal_context.sql
  - src/domain/catalog/product.ts
  - src/lib/supabase/mappers.ts
  - src/__tests__/recommendation-engine.test.ts
  - src/domain/recommendation/recommendation-engine.ts
  - src/app/(app)/inicio/inicio-client.tsx
  - src/__tests__/cart-store.test.ts
  - src/__tests__/compatibility.test.ts
  - src/app/(app)/perfil/favoritos/page.tsx
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 04-4: Code Review Report

**Reviewed:** 2026-04-23
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

This phase adds meal context filtering to the recommendation engine: a new `meal_context` DB column, an updated `Product` type, engine extension, a chip filter UI in `inicio-client.tsx`, and an updated `favoritos` page that carries the new `mealContext` field through saved combo items. The migration, domain model, mapper, and engine are all clean. Tests are comprehensive and well-structured.

Three warnings were found: (1) a loading state that never resolves on Supabase error in `favoritos/page.tsx`, (2) unguarded division-by-zero in macro progress bars in `inicio-client.tsx`, and (3) a fragility in the `cart-store` test's `beforeEach` reset that can carry over computed totals between tests. Two info items cover a mismatched comment label in the engine and an unhandled delete-failure scenario in `favoritos`.

---

## Warnings

### WR-01: `setLoading(false)` never called on Supabase error in `favoritos/page.tsx`

**File:** `src/app/(app)/perfil/favoritos/page.tsx:29-41`

**Issue:** The `load()` async function calls `setLoading(false)` only at the end of the happy path (line 39). If the Supabase `.select()` call returns an error object or throws (network failure, RLS denial, etc.), `setLoading` is never set to `false`. The component remains permanently in loading state showing "Cargando..." with no recovery path.

```tsx
// Current code — missing error branch
const load = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;                        // ← setLoading(false) NOT called here either
  const { data } = await supabase
    .from("favorite_combos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  setCombos((data ?? []) as Combo[]);
  setLoading(false);                        // ← only reached on success
};
```

**Fix:** Use a `try/finally` block (or explicit error branch) to guarantee `setLoading(false)` always fires. Also handle the early-return case where the user is not authenticated.

```tsx
const load = async () => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("favorite_combos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setCombos((data ?? []) as Combo[]);
  } finally {
    setLoading(false);
  }
};
```

---

### WR-02: Division by zero for macro progress bars when goals are zero

**File:** `src/app/(app)/inicio/inicio-client.tsx:70-73`

**Issue:** The `pct` field for each macro bar divides `totals[macro]` by `goals[macro]` without guarding for `goals[macro] === 0`. If a user has no goal set for protein, carbs, or fat (possible when goals have not yet been fetched or are explicitly 0), `pct` becomes `NaN` after `Math.min(NaN, 100)`. The inline style `width: "NaN%"` is silently ignored by browsers (renders as 0-width bar), but `NaN` can propagate if the component is extended. The calories percentage on line 67 already has a correct guard (`goals.calories > 0 ? ... : 0`) that is not applied to the individual macro bars.

```tsx
// Current — missing guard
{ label: "Proteína", value: `${totals.protein}g`, color: "#43A047",
  pct: Math.min((totals.protein / goals.protein) * 100, 100) },
```

**Fix:** Apply the same guard pattern used for calories:

```tsx
const safePct = (current: number, goal: number) =>
  goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

const macros = [
  { label: "Proteína", value: `${totals.protein}g`, color: "#43A047",
    pct: safePct(totals.protein, goals.protein) },
  { label: "Carbos",   value: `${totals.carbs}g`,   color: "#FB8C00",
    pct: safePct(totals.carbs, goals.carbs) },
  { label: "Grasas",   value: `${totals.fat}g`,     color: "#1E88E5",
    pct: safePct(totals.fat, goals.fat) },
];
```

---

### WR-03: `beforeEach` in `cart-store.test.ts` carries over computed `totals` from previous test

**File:** `src/__tests__/cart-store.test.ts:27-34`

**Issue:** The `beforeEach` reset reads `totals` from the store at reset time: `totals: useCartStore.getState().totals`. If any preceding test triggers a `totals` recomputation (e.g., through `addItem` or `removeItem` actions), the next test starts with those modified totals rather than the initial all-zero totals. No test in the current suite directly exposes this (all tested actions target `items`, `purchaseDays`, or `lastUpdated`), but the pattern is fragile and will silently corrupt state if a future test exercises actions that mutate `totals`.

```ts
// Current — totals captured from live store state
beforeEach(() => {
  useCartStore.setState({
    items: [],
    totals: useCartStore.getState().totals,  // ← stale after a totals-mutating test
    purchaseDays: 1,
    lastUpdated: new Date().toDateString(),
  });
});
```

**Fix:** Reset `totals` to the known zero state explicitly:

```ts
const ZERO_TOTALS = { protein: 0, carbs: 0, fat: 0, calories: 0, price: 0, itemCount: 0 };

beforeEach(() => {
  useCartStore.setState({
    items: [],
    totals: ZERO_TOTALS,
    purchaseDays: 1,
    lastUpdated: new Date().toDateString(),
  });
});
```

---

## Info

### IN-01: Duplicate "Step 4" comment label in `recommendation-engine.ts`

**File:** `src/domain/recommendation/recommendation-engine.ts:96` and `110`

**Issue:** Both the scoring block (line 96: `// Step 4: Score with optional price-blend`) and the badge-mutation block (line 110: `// Step 4: Badge top-1 AFTER slice`) are labeled "Step 4". The badge step is logically Step 5, making the numbered flow misleading for future readers.

**Fix:** Renumber the badge comment to `// Step 5: Badge top-1 AFTER slice`.

---

### IN-02: `handleDelete` in `favoritos/page.tsx` gives no feedback on failure

**File:** `src/app/(app)/perfil/favoritos/page.tsx:50-54`

**Issue:** `handleDelete` optimistically removes the combo from local state before confirming the server delete succeeded. If the Supabase delete fails (RLS error, network drop), the UI removes the item locally but it reappears on the next page load with no error communicated to the user.

```ts
const handleDelete = async (id: string) => {
  const supabase = createClient();
  await supabase.from("favorite_combos").delete().eq("id", id); // error silently dropped
  setCombos((prev) => prev.filter((c) => c.id !== id));         // always runs
};
```

**Fix:** Check the error before updating local state, or use a pessimistic update pattern:

```ts
const handleDelete = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from("favorite_combos").delete().eq("id", id);
  if (error) {
    // surface to user (toast, alert, etc.)
    console.error("No se pudo eliminar la combinación:", error.message);
    return;
  }
  setCombos((prev) => prev.filter((c) => c.id !== id));
};
```

---

_Reviewed: 2026-04-23_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
