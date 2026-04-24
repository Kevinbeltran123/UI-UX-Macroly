-- ============================================================================
-- Macroly — Catalog expansion (Phase 5)
-- DB-01: ≥30 new products with dietary_tags + meal_context
-- DB-02: Covers vegan, gluten-free, snack/breakfast, varied price range
-- DB-03: UPDATE existing products with dietary_tags + meal_context
-- Only INSERT and UPDATE — no DROP, no schema changes
-- ============================================================================

-- ============================================================================
-- DB-03: Tag existing products
-- ============================================================================

UPDATE public.products
SET dietary_tags = ARRAY['sin_gluten','alto_proteico'],
    meal_context = 'any'
WHERE name = 'Pechuga de Pollo';

UPDATE public.products
SET dietary_tags = ARRAY['vegano','sin_gluten','sin_lactosa'],
    meal_context = 'any'
WHERE name = 'Arroz Integral';

UPDATE public.products
SET dietary_tags = ARRAY['sin_gluten','sin_lactosa','alto_proteico'],
    meal_context = 'breakfast'
WHERE name = 'Huevos AAA x12';

UPDATE public.products
SET dietary_tags = ARRAY['vegano','sin_lactosa'],
    meal_context = 'breakfast'
WHERE name = 'Avena en Hojuelas';

UPDATE public.products
SET dietary_tags = ARRAY['sin_gluten','sin_lactosa','alto_proteico'],
    meal_context = 'any'
WHERE name = 'Atun en Agua';

UPDATE public.products
SET dietary_tags = ARRAY['vegano','sin_gluten','sin_lactosa'],
    meal_context = 'breakfast'
WHERE name = 'Banano x6';

UPDATE public.products
SET dietary_tags = ARRAY['vegano','sin_gluten','sin_lactosa'],
    meal_context = 'any'
WHERE name = 'Aguacate Hass x2';

UPDATE public.products
SET dietary_tags = ARRAY['sin_gluten'],
    meal_context = 'any'
WHERE name = 'Leche Deslactosada';

UPDATE public.products
SET dietary_tags = ARRAY['vegano'],
    meal_context = 'breakfast'
WHERE name = 'Pan Integral';

UPDATE public.products
SET dietary_tags = ARRAY['sin_gluten','alto_proteico'],
    meal_context = 'any'
WHERE name = 'Proteina Whey';

UPDATE public.products
SET dietary_tags = ARRAY['sin_gluten','alto_proteico'],
    meal_context = 'breakfast'
WHERE name = 'Yogur Griego';

UPDATE public.products
SET dietary_tags = ARRAY['vegano'],
    meal_context = 'lunch'
WHERE name = 'Pasta Integral';

-- ============================================================================
-- DB-01 / DB-02: Insert ≥30 new products
-- Groups: vegano, sin_gluten, snacks/desayuno, proteinas adicionales, complementos
-- Macros: per 100g serving, integers. Price: COP.
-- ============================================================================

insert into public.products
  (name, brand, weight, image_url, price, protein, carbs, fat, calories, category_id, rating, dietary_tags, meal_context)
values

-- ── VEGANO ──────────────────────────────────────────────────────────────────

  ('Tofu Natural', 'SoyVida', '400g',
   '/products/tofu-natural.jpg',
   7800, 17, 2, 8, 144, 'proteina', 4.3,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Tempeh de Soya', 'SoyVida', '250g',
   '/products/tempeh-soya.jpg',
   9200, 19, 9, 11, 192, 'proteina', 4.2,
   ARRAY['vegano','sin_gluten','sin_lactosa','alto_proteico'], 'any'),

  ('Proteina Vegetal en Polvo', 'PlantPower', '500g',
   '/products/proteina-vegetal.jpg',
   45000, 75, 6, 4, 360, 'suplemento', 4.4,
   ARRAY['vegano','sin_gluten','sin_lactosa','alto_proteico'], 'any'),

  ('Leche de Almendras', 'Alpina', '1L',
   '/products/leche-almendras.jpg',
   8500, 1, 3, 3, 43, 'lacteo', 4.3,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Leche de Soya', 'Ades', '1L',
   '/products/leche-soya.jpg',
   7200, 3, 4, 2, 47, 'lacteo', 4.2,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Garbanzos Cocidos', 'Facundo', '400g',
   '/products/garbanzos.jpg',
   4500, 9, 27, 3, 164, 'carbohidrato', 4.4,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'lunch'),

  ('Lentejas Secas', 'Facundo', '500g',
   '/products/lentejas.jpg',
   4200, 9, 20, 0, 116, 'carbohidrato', 4.5,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'lunch'),

  ('Edamame Congelado', 'Finca Local', '400g',
   '/products/edamame.jpg',
   8800, 11, 10, 5, 122, 'proteina', 4.3,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Mantequilla de Mani', 'Jif', '340g',
   '/products/mantequilla-mani.jpg',
   18500, 26, 20, 50, 588, 'grasa', 4.5,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

-- ── SIN GLUTEN ───────────────────────────────────────────────────────────────

  ('Quinoa Blanca', 'Grano de Oro', '500g',
   '/products/quinoa-blanca.jpg',
   12000, 14, 64, 6, 368, 'carbohidrato', 4.6,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Arroz Blanco x5kg', 'Diana', '5kg',
   '/products/arroz-blanco.jpg',
   18500, 7, 79, 1, 359, 'carbohidrato', 4.4,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Pasta de Arroz', 'Barilla', '500g',
   '/products/pasta-arroz.jpg',
   9800, 3, 79, 0, 353, 'carbohidrato', 4.2,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'lunch'),

  ('Harina de Almendras', 'Bob''s Red Mill', '400g',
   '/products/harina-almendras.jpg',
   28000, 21, 20, 50, 596, 'carbohidrato', 4.5,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Avena sin Gluten', 'Quaker', '400g',
   '/products/avena-sin-gluten.jpg',
   9500, 13, 64, 7, 369, 'carbohidrato', 4.4,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Pan sin Gluten', 'Ener-G', '400g',
   '/products/pan-sin-gluten.jpg',
   14500, 3, 46, 4, 228, 'carbohidrato', 3.9,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

-- ── SNACKS / DESAYUNO ────────────────────────────────────────────────────────

  ('Granola Artesanal', 'Noel', '400g',
   '/products/granola.jpg',
   14200, 8, 62, 11, 381, 'carbohidrato', 4.4,
   ARRAY['vegano','sin_lactosa'], 'breakfast'),

  ('Manzana Roja x4', 'Finca Local', '~600g',
   '/products/manzana-roja.jpg',
   4800, 0, 14, 0, 52, 'fruta', 4.5,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Arandanos Frescos', 'Finca Local', '250g',
   '/products/arandanos.jpg',
   9500, 1, 14, 1, 57, 'fruta', 4.6,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Fresas x500g', 'Finca Local', '500g',
   '/products/fresas.jpg',
   6800, 1, 8, 0, 32, 'fruta', 4.5,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Mango Tommy x2', 'Finca Local', '~500g',
   '/products/mango.jpg',
   5200, 1, 15, 0, 60, 'fruta', 4.6,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

-- ── PROTEINAS ADICIONALES ────────────────────────────────────────────────────

  ('Sardinas en Aceite', 'La Sirena', '120g',
   '/products/sardinas-aceite.jpg',
   4200, 25, 0, 11, 208, 'proteina', 4.3,
   ARRAY['sin_gluten','sin_lactosa','alto_proteico'], 'any'),

  ('Salmon en Lata', 'Princes', '213g',
   '/products/salmon-lata.jpg',
   12800, 25, 0, 7, 158, 'proteina', 4.5,
   ARRAY['sin_gluten','sin_lactosa','alto_proteico'], 'any'),

  ('Pechuga de Pavo', 'Zenú', '500g',
   '/products/pechuga-pavo.jpg',
   18500, 29, 0, 1, 135, 'proteina', 4.5,
   ARRAY['sin_gluten','sin_lactosa','alto_proteico'], 'any'),

  ('Clara de Huevo en Carton', 'Santa Reyes', '946ml',
   '/products/clara-huevo-carton.jpg',
   15800, 11, 1, 0, 47, 'proteina', 4.4,
   ARRAY['sin_gluten','sin_lactosa','alto_proteico'], 'breakfast'),

  ('Queso Cottage', 'Alpina', '500g',
   '/products/queso-cottage.jpg',
   13500, 11, 3, 4, 98, 'lacteo', 4.4,
   ARRAY['sin_gluten','alto_proteico'], 'breakfast'),

  ('Jamon de Pavo', 'Zenú', '200g',
   '/products/jamon-pavo.jpg',
   9800, 18, 2, 3, 110, 'proteina', 4.1,
   ARRAY['sin_gluten','sin_lactosa','alto_proteico'], 'any'),

  ('Crema de Atun', 'Van Camp''s', '160g',
   '/products/crema-atun.jpg',
   6200, 20, 1, 4, 116, 'proteina', 4.2,
   ARRAY['sin_gluten','sin_lactosa','alto_proteico'], 'any'),

-- ── COMPLEMENTOS ─────────────────────────────────────────────────────────────

  ('Aceite de Oliva Extra Virgen', 'Olivetto', '500ml',
   '/products/aceite-oliva.jpg',
   28000, 0, 0, 100, 884, 'grasa', 4.7,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Nueces Mixtas', 'Organix', '200g',
   '/products/nueces.jpg',
   19800, 14, 21, 54, 607, 'grasa', 4.6,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Semillas de Chia', 'Organix', '250g',
   '/products/semillas-chia.jpg',
   14500, 17, 42, 31, 486, 'suplemento', 4.6,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Semillas de Lino', 'Organix', '250g',
   '/products/semillas-lino.jpg',
   11500, 18, 29, 42, 534, 'suplemento', 4.5,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Proteina Whey Chocolate', 'Star Nutrition', '908g',
   '/products/whey-chocolate.jpg',
   92000, 70, 10, 4, 356, 'suplemento', 4.8,
   ARRAY['sin_gluten','alto_proteico'], 'breakfast'),

  ('Proteina Whey Fresa', 'Star Nutrition', '908g',
   '/products/whey-fresa.jpg',
   92000, 70, 10, 4, 356, 'suplemento', 4.7,
   ARRAY['sin_gluten','alto_proteico'], 'breakfast'),

  ('Creatina Monohidrato', 'Star Nutrition', '300g',
   '/products/creatina.jpg',
   55000, 0, 0, 0, 0, 'suplemento', 4.8,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Huevos de Codorniz x20', 'Santa Reyes', '~300g',
   '/products/huevos-codorniz.jpg',
   9800, 13, 1, 11, 158, 'proteina', 4.3,
   ARRAY['sin_gluten','sin_lactosa'], 'breakfast'),

  ('Leche de Coco', 'Goya', '400ml',
   '/products/leche-coco.jpg',
   8200, 2, 6, 17, 197, 'lacteo', 4.2,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any'),

  ('Cacao en Polvo sin Azucar', 'Nestlé', '200g',
   '/products/cacao-polvo.jpg',
   12800, 20, 54, 14, 228, 'suplemento', 4.5,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'breakfast'),

  ('Merey Tostado sin Sal', 'Organix', '200g',
   '/products/merey-tostado.jpg',
   21500, 18, 30, 44, 553, 'grasa', 4.4,
   ARRAY['vegano','sin_gluten','sin_lactosa'], 'any');
