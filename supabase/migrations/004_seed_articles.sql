-- ============================================================================
-- Seed: educational articles
-- Source: prototipo-legacy/src/macroly-completo.html (ARTICLES array)
-- Note: related_product_ids are seeded later via update because they reference
--       products by name (we don't know UUIDs at insert time).
-- ============================================================================

insert into public.articles (slug, title, tag, reading_time, icon, content) values
(
  'que-son-los-macronutrientes',
  'Que son los macronutrientes?',
  'Basico',
  5,
  'activity',
  '[
    {"title": "Proteinas", "text": "Las proteinas son esenciales para la construccion y reparacion de tejidos musculares. Se componen de aminoacidos, de los cuales 9 son esenciales y deben obtenerse de la dieta. Fuentes de proteina de alta calidad incluyen pollo, pescado, huevos, lacteos y legumbres. Se recomienda consumir entre 1.6 y 2.2 gramos por kilogramo de peso corporal para personas activas."},
    {"title": "Carbohidratos", "text": "Los carbohidratos son la principal fuente de energia del cuerpo. Se clasifican en simples (azucares) y complejos (almidones y fibra). Los carbohidratos complejos como avena, arroz integral y pasta integral proporcionan energia sostenida. La fibra ayuda a la digestion y al control del azucar en sangre."},
    {"title": "Grasas", "text": "Las grasas son necesarias para la absorcion de vitaminas liposolubles (A, D, E, K), la produccion hormonal y la proteccion de organos. Las grasas saludables se encuentran en aguacate, frutos secos, aceite de oliva y pescados grasos. Se recomienda que representen entre el 20-35% de las calorias totales diarias."}
  ]'::jsonb
),
(
  'fuentes-de-proteina-economicas',
  'Fuentes de proteina economicas en Colombia',
  'Nutricion',
  5,
  'activity',
  '[
    {"title": "Huevos: la mejor relacion costo-beneficio", "text": "Los huevos son una de las fuentes de proteina mas completas y economicas disponibles. Un huevo grande contiene aproximadamente 6g de proteina con todos los aminoacidos esenciales. Con un carton de 30 huevos a menos de $15,000, obtienes mas de 180g de proteina total."},
    {"title": "Pollo y atun", "text": "La pechuga de pollo es la opcion clasica para quienes buscan proteina magra. El atun enlatado en agua es otra opcion excelente: es practico, duradero y ofrece alrededor de 26g de proteina por lata a un precio accesible. Ambos son pilares de cualquier dieta alta en proteina."},
    {"title": "Legumbres y lacteos", "text": "Los frijoles, lentejas y garbanzos son fuentes de proteina vegetal economicas. Aunque no son proteina completa por si solos, combinados con cereales forman proteinas de alta calidad. El yogur griego y la leche deslactosada son opciones lacteas con buena relacion precio-proteina."}
  ]'::jsonb
),
(
  'macros-en-dias-de-entreno',
  'Como ajustar macros en dias de entreno',
  'Fitness',
  4,
  'dumbbell',
  '[
    {"title": "Dias de entrenamiento", "text": "En dias de entreno intenso, aumenta tus carbohidratos en un 20-30% para tener energia suficiente. La proteina debe mantenerse alta (1.8-2.2g/kg) para la recuperacion muscular. Consume una comida rica en carbohidratos y proteina 2-3 horas antes del entreno y otra dentro de la primera hora posterior."},
    {"title": "Dias de descanso", "text": "En dias de descanso, puedes reducir los carbohidratos un 15-20% y mantener las grasas saludables un poco mas altas. La proteina se mantiene igual para apoyar la recuperacion. Enfocate en alimentos integrales y nutricionalmente densos."},
    {"title": "Hidratacion y micronutrientes", "text": "No olvides la hidratacion: consume al menos 2-3 litros de agua diarios, mas si entrenas. Los micronutrientes como magnesio, zinc y vitaminas del complejo B son cruciales para el metabolismo energetico y la recuperacion muscular."}
  ]'::jsonb
),
(
  'como-leer-tabla-nutricional',
  'Como leer una tabla nutricional',
  'Basico',
  3,
  'info',
  '[
    {"title": "Tamano de la porcion", "text": "Lo primero que debes revisar es el tamano de la porcion. Todos los valores nutricionales estan basados en esta medida. Si consumes el doble de la porcion indicada, debes multiplicar todos los valores por dos. Un error comun es asumir que los valores corresponden al paquete completo."},
    {"title": "Macronutrientes clave", "text": "Busca los gramos de proteina, carbohidratos totales (incluyendo fibra y azucares) y grasas totales (incluyendo saturadas y trans). Las grasas trans deben ser 0g idealmente. La fibra dietetica debe ser lo mas alta posible, ya que contribuye a la saciedad y salud digestiva."},
    {"title": "Porcentaje del valor diario", "text": "El porcentaje del valor diario (%VD) te indica que proporcion de la ingesta diaria recomendada cubre una porcion. Un valor de 5% o menos se considera bajo, mientras que 20% o mas se considera alto. Usa estos porcentajes como guia rapida para evaluar si un alimento es buena fuente de un nutriente."}
  ]'::jsonb
),
(
  'meal-prep-en-una-hora',
  'Meal prep: planifica tu semana en 1 hora',
  'Tips',
  6,
  'calendar',
  '[
    {"title": "Planificacion y compras", "text": "Empieza calculando tus macros semanales totales. Haz una lista de compras basada en proteinas (pollo, huevos, atun), carbohidratos (arroz, avena, pasta) y grasas (aguacate, aceite de oliva). Compra en cantidad para reducir costos. Macroly te ayuda a calcular exactamente cuanto necesitas."},
    {"title": "Coccion por lotes", "text": "Dedica 1 hora del domingo a cocinar. Prepara una proteina principal (ej: 1kg de pechuga), un carbohidrato base (ej: arroz integral), y verduras al vapor o asadas. Divide en porciones iguales en recipientes hermeticos. Cada porcion debe tener el balance de macros que necesitas."},
    {"title": "Almacenamiento y rotacion", "text": "Las comidas preparadas duran 3-4 dias en refrigeracion y hasta 3 meses congeladas. Etiqueta cada recipiente con la fecha y contenido de macros. Rota las proteinas entre pollo, pescado y huevos para variedad. Prepara salsas y condimentos por separado para mantener la frescura."}
  ]'::jsonb
),
(
  'alimentacion-para-hipertensos',
  'Alimentacion para hipertensos',
  'Salud',
  5,
  'shield',
  '[
    {"title": "Reducir el sodio", "text": "El sodio es el principal factor dietetico en la hipertension. Limita tu consumo a menos de 2,300mg diarios (idealmente 1,500mg). Evita alimentos procesados, embutidos, sopas instantaneas y snacks salados. Cocina con especias y hierbas en lugar de sal para dar sabor."},
    {"title": "Dieta DASH", "text": "La dieta DASH (Dietary Approaches to Stop Hypertension) enfatiza frutas, verduras, granos integrales, proteinas magras y lacteos bajos en grasa. Esta dieta es rica en potasio, calcio y magnesio, minerales que ayudan a regular la presion arterial."},
    {"title": "Alimentos recomendados", "text": "Prioriza bananos (ricos en potasio), yogur griego bajo en grasa, avena, pescados ricos en omega-3, y aguacate. Estos alimentos no solo apoyan el control de la presion sino que tambien aportan macronutrientes de calidad para mantener un peso saludable."}
  ]'::jsonb
);

-- Link related products by article slug + product name (avoids hardcoding UUIDs)
-- Article 1: pollo, atun, arroz integral, aguacate
update public.articles
set related_product_ids = (
  select array_agg(id) from public.products
  where name in ('Pechuga de Pollo', 'Atun en Agua', 'Arroz Integral', 'Aguacate Hass x2')
)
where slug = 'que-son-los-macronutrientes';

-- Article 2: huevos, atun, pollo, yogur griego
update public.articles
set related_product_ids = (
  select array_agg(id) from public.products
  where name in ('Huevos AAA x12', 'Atun en Agua', 'Pechuga de Pollo', 'Yogur Griego')
)
where slug = 'fuentes-de-proteina-economicas';

-- Article 3: pollo, whey, avena, arroz
update public.articles
set related_product_ids = (
  select array_agg(id) from public.products
  where name in ('Pechuga de Pollo', 'Proteina Whey', 'Avena en Hojuelas', 'Arroz Integral')
)
where slug = 'macros-en-dias-de-entreno';

-- Article 4: pan, avena, pasta, leche
update public.articles
set related_product_ids = (
  select array_agg(id) from public.products
  where name in ('Pan Integral', 'Avena en Hojuelas', 'Pasta Integral', 'Leche Deslactosada')
)
where slug = 'como-leer-tabla-nutricional';

-- Article 5: pollo, arroz, avena, atun
update public.articles
set related_product_ids = (
  select array_agg(id) from public.products
  where name in ('Pechuga de Pollo', 'Arroz Integral', 'Avena en Hojuelas', 'Atun en Agua')
)
where slug = 'meal-prep-en-una-hora';

-- Article 6: banano, yogur, avena, atun
update public.articles
set related_product_ids = (
  select array_agg(id) from public.products
  where name in ('Banano x6', 'Yogur Griego', 'Avena en Hojuelas', 'Atun en Agua')
)
where slug = 'alimentacion-para-hipertensos';
