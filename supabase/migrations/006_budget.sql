-- ============================================================================
-- Macroly — Budget column (Phase 3)
-- ============================================================================
-- PRICE-02: Add max_budget to profiles (user budget cap for recommendations)
-- Additive ALTER TABLE only — no DROP, no recreate
-- IF NOT EXISTS prevents errors on re-run (e.g., repeated supabase db push)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS max_budget numeric;
-- No DEFAULT — NULL means "no budget set" (D-05)
-- No NOT NULL constraint — NULL is valid (budget optimization disabled)

-- WR-003: Defense-in-depth non-negativity constraint.
-- IF NOT EXISTS not available for constraints pre-PG 9.5; use DO block for idempotency.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_schema = 'public'
      AND constraint_name   = 'profiles_max_budget_positive'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_max_budget_positive CHECK (max_budget > 0);
  END IF;
END$$;
