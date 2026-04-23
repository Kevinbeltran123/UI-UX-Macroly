-- ============================================================================
-- Macroly — Meal context column (Phase 4)
-- ============================================================================
-- MEAL-01: Add meal_context to products (catalog metadata for meal moment filter)
-- D-01: Additive ALTER TABLE only — no DROP, no recreate
-- D-02: DEFAULT 'any' means all existing products appear in all meal filters until explicitly migrated
-- IF NOT EXISTS prevents errors on re-run (e.g., repeated supabase db push)

-- Add meal context to the product catalog
-- Valid values: 'any' | 'breakfast' | 'lunch' | 'dinner'
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS meal_context text NOT NULL DEFAULT 'any';

-- Idempotent CHECK constraint: validate enum values at DB level (D-01)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_schema = 'public'
      AND constraint_name   = 'products_meal_context_valid'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_meal_context_valid
        CHECK (meal_context IN ('any', 'breakfast', 'lunch', 'dinner'));
  END IF;
END$$;
