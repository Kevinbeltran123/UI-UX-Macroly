-- ============================================================================
-- Macroly — Dietary restriction columns (Phase 2)
-- ============================================================================
-- D-01: Add dietary_restrictions to profiles (user identity-level preference)
-- D-02: Add dietary_tags to products (catalog metadata)
-- D-03: Both are additive ALTER TABLE — no DROP, no recreate
-- IF NOT EXISTS prevents errors on re-run (e.g., repeated supabase db push)

-- Add dietary tags to the product catalog
-- Valid values: vegano, sin_gluten, sin_lactosa, sin_mariscos, alto_proteico
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS dietary_tags text[] NOT NULL DEFAULT '{}';

-- Add dietary restrictions to user profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dietary_restrictions text[] NOT NULL DEFAULT '{}';
