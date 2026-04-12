-- ============================================================================
-- Seed: categories + products
-- Source: prototipo-legacy/src/macroly-completo.html (PRODUCTS array)
-- ============================================================================

insert into public.categories (id, label, sort_order) values
  ('proteina', 'Proteinas', 1),
  ('carbohidrato', 'Carbohidratos', 2),
  ('grasa', 'Grasas saludables', 3),
  ('lacteo', 'Lacteos', 4),
  ('fruta', 'Frutas', 5),
  ('suplemento', 'Suplementos', 6)
on conflict (id) do nothing;

insert into public.products (name, brand, weight, image_url, price, protein, carbs, fat, calories, category_id, rating) values
  ('Pechuga de Pollo', 'Pollos Bucanero', '500g', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop', 12500, 55, 0, 3, 247, 'proteina', 4.8),
  ('Arroz Integral', 'Diana', '1kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', 6800, 14, 152, 5, 710, 'carbohidrato', 4.5),
  ('Huevos AAA x12', 'Santa Reyes', '780g', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop', 8900, 72, 0, 60, 828, 'proteina', 4.7),
  ('Avena en Hojuelas', 'Quaker', '500g', 'https://images.unsplash.com/photo-1614961233913-a5113e3d5f0e?w=400&h=400&fit=crop', 5400, 17, 134, 14, 730, 'carbohidrato', 4.4),
  ('Atun en Agua', 'Van Camp''s', '160g', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=400&fit=crop', 5200, 26, 0, 1, 113, 'proteina', 4.6),
  ('Banano x6', 'Finca Local', '~720g', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop', 3200, 6, 54, 2, 258, 'fruta', 4.3),
  ('Aguacate Hass x2', 'Finca Local', '~400g', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop', 5800, 4, 12, 30, 322, 'grasa', 4.5),
  ('Leche Deslactosada', 'Alpina', '1.1L', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', 6200, 33, 48, 28, 572, 'lacteo', 4.4),
  ('Pan Integral', 'Bimbo', '480g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop', 7100, 20, 88, 8, 504, 'carbohidrato', 4.2),
  ('Proteina Whey', 'Star Nutrition', '908g', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop', 89900, 72, 8, 4, 356, 'suplemento', 4.9),
  ('Yogur Griego', 'Alpina', '500g', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop', 9500, 25, 18, 5, 217, 'lacteo', 4.6),
  ('Pasta Integral', 'Doria', '500g', 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop', 4800, 15, 140, 4, 660, 'carbohidrato', 4.3);
