---
phase: 04-4
plan: 01
subsystem: database
tags: [supabase, sql, typescript, domain-model, meal-context]

# Dependency graph
requires:
  - phase: 02
    provides: dietaryTags field on Product type and mappers.ts mapping pattern
provides:
  - Supabase migration 007_meal_context.sql with additive ALTER TABLE and idempotent CHECK constraint
  - Product domain type extended with mealContext literal union ('any' | 'breakfast' | 'lunch' | 'dinner')
  - mapProduct() mapper extended with row.meal_context ?? 'any' null-safe mapping
affects: [04-02-engine-extension, 04-03-chip-filter-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive migration pattern: ALTER TABLE ... ADD COLUMN IF NOT EXISTS with DEFAULT"
    - "Idempotent CHECK constraint via DO$$ block with information_schema guard"
    - "Null-safe mapper field: row.column ?? 'default' for pre-migration row safety"

key-files:
  created:
    - supabase/migrations/007_meal_context.sql
  modified:
    - src/domain/catalog/product.ts
    - src/lib/supabase/mappers.ts
    - src/__tests__/recommendation-engine.test.ts

key-decisions:
  - "meal_context as text NOT NULL DEFAULT 'any' — DB-level enum validated by CHECK constraint, not a Postgres enum type (matches existing dietary_tags pattern)"
  - "mealContext defaults to 'any' in both mapper and test helper — backward compatible with pre-migration rows and existing test calls"

patterns-established:
  - "Phase N field addition: append after last existing field in Product type, never remove prior fields"
  - "Test helper update: add optional param with default to keep all existing call sites valid"

requirements-completed: [MEAL-01, MEAL-02, MEAL-03]

# Metrics
duration: 2min
completed: 2026-04-23
---

# Phase 4 Plan 01: Meal Context Schema and Domain Layer Summary

**meal_context DB column added to products via additive migration with CHECK enum constraint, mirrored in Product type as mealContext literal union and null-safe mapProduct() field**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-23T19:24:15Z
- **Completed:** 2026-04-23T19:25:25Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `supabase/migrations/007_meal_context.sql` with additive ALTER TABLE (IF NOT EXISTS), DEFAULT 'any' for backward compatibility, and idempotent DO$$ CHECK constraint `products_meal_context_valid`
- Extended `Product` type with `mealContext: 'any' | 'breakfast' | 'lunch' | 'dinner'` as 14th field, preserving all existing fields including `dietaryTags`
- Extended `mapProduct()` with `mealContext: row.meal_context ?? 'any'` null-safe mapping for pre-migration row safety
- Updated `makeProduct()` test helper with optional `mealContext` param (default `'any'`) — all 54 existing tests continue to pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration 007_meal_context.sql** - `a8b0b6a` (feat)
2. **Task 2: Extend Product type and mapProduct() mapper** - `0fb9fe3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `supabase/migrations/007_meal_context.sql` - Additive migration adding meal_context column with CHECK constraint
- `src/domain/catalog/product.ts` - Product type extended with mealContext literal union (14th field)
- `src/lib/supabase/mappers.ts` - mapProduct() extended with mealContext null-safe mapping
- `src/__tests__/recommendation-engine.test.ts` - makeProduct() helper updated with optional mealContext param

## Decisions Made

- Used `text NOT NULL DEFAULT 'any'` (not a Postgres enum type) — consistent with the dietary_tags pattern already in the codebase; CHECK constraint provides enum validation at DB level
- `mealContext` defaults to `'any'` in both the mapper and test helper — ensures all existing products (pre-migration) appear in all meal context filters without data migration

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Migration will be applied on next `supabase db push`.

## Next Phase Readiness

- `mealContext` field available on `Product` type — 04-02 (engine extension) can add `mealContext` parameter to `recommend()`
- `mapProduct()` correctly populates `mealContext` from DB rows — 04-03 (chip filter UI) can read the field from catalog data
- All existing tests pass — no regression risk to downstream plans

## Threat Mitigation Verified

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-4-01 Tampering: products.meal_context | CHECK constraint `products_meal_context_valid` in migration | Applied |
| T-4-03 Spoofing: migration re-run | `IF NOT EXISTS` column guard + DO$$ constraint guard | Applied |

---
*Phase: 04-4*
*Completed: 2026-04-23*
