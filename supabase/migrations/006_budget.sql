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
-- No CHECK constraint — UI enforces >= 0; server saves null for <= 0 (T-3-03)
