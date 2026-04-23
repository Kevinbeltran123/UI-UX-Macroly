# Requirements: Macroly Feature Expansion

**Defined:** 2026-04-22
**Core Value:** Un usuario arma un carrito para N días, ve cómo cubre sus metas de macros para ese período, y recibe recomendaciones que respetan sus restricciones dietéticas y presupuesto.

---

## v1 Requirements

### Correcciones Críticas (Bugs)

- [x] **FIX-01
**: El carrito se resetea automáticamente cuando la fecha cambia (TTL diario via `onRehydrateStorage` en Zustand persist, comparando `lastUpdated` con la fecha actual)
- [x] **FIX-02
**: Las metas reales del usuario (cargadas desde Supabase) se almacenan en un `useGoalsStore` y se pasan correctamente a `useCart(goals)` en todos los call sites (`carrito`, `inicio-client`, `catalogo-client`, `product-detail-client`)
- [x] **FIX-03
**: `nextComboName` importado en `carrito/page.tsx` se usa en lugar de la lógica inline duplicada

### Período de Compra (Feature 1)

- [x] **PERIOD-01
**: Usuario puede seleccionar período de compra con opciones 1, 2, 3, 5, 7 días desde la vista de carrito
- [x] **PERIOD-02
**: Usuario puede seleccionar período de compra desde la vista de inicio (mismo componente o acceso equivalente)
- [x] **PERIOD-03
**: Las metas de macros se calculan como `meta_diaria × días_seleccionados` para todos los cálculos
- [x] **PERIOD-04
**: Las barras de progreso muestran el progreso contra las metas ajustadas al período
- [x] **PERIOD-05
**: Los badges de compatibilidad ("fits" / "tight" / "exceeds") usan las metas ajustadas al período
- [x] **PERIOD-06
**: El motor de recomendaciones usa las metas ajustadas al período para calcular el gap
- [x] **PERIOD-07
**: El período seleccionado se persiste en el store de Zustand (mismo store del carrito, campo `purchaseDays: number`)
- [x] **PERIOD-08
**: Las órdenes recurrentes muestran texto de feedback indicando cuántos días de cobertura provee el carrito actual

### Restricciones Dietéticas (Feature 2a)

- [ ] **DIET-01**: La tabla de productos en Supabase tiene columna `dietary_tags: text[]` (vegano, sin_gluten, sin_lactosa, sin_mariscos, alto_proteico)
- [ ] **DIET-02**: El tipo `Product` en `src/domain/catalog/product.ts` incluye `dietaryTags: string[]`
- [ ] **DIET-03**: El mapper de Supabase (`src/lib/supabase/mappers.ts`) mapea `dietary_tags` a `dietaryTags`
- [ ] **DIET-04**: El perfil del usuario en Supabase tiene tabla/columna para `dietary_restrictions: text[]`
- [ ] **DIET-05**: El usuario puede seleccionar sus restricciones dietéticas desde la sección "Condiciones de salud" en el perfil (reemplaza el enlace muerto `href="#"`)
- [ ] **DIET-06**: Las restricciones se cargan en el `useGoalsStore` o un store equivalente junto con las metas
- [ ] **DIET-07**: El motor de recomendaciones filtra productos cuyos `dietaryTags` no incluyan las restricciones del usuario ANTES de calcular el score
- [ ] **DIET-08**: La función `recommend()` acepta parámetro `restrictions: string[]` y aplica el filtro

### Optimización de Precio (Feature 2b)

- [x] **PRICE-01
**: El usuario puede setear un presupuesto máximo de compra desde el perfil o el carrito
- [ ] **PRICE-02**: El presupuesto se persiste en Supabase en el perfil del usuario
- [x] **PRICE-03
**: La función `recommend()` acepta parámetro opcional `maxBudget: number` y filtra productos que superan el precio por unidad que no cabe en el presupuesto restante
- [x] **PRICE-04
**: El score de recomendación incluye componente de eficiencia: `macro_gap_score / price` cuando `maxBudget` está definido
- [x] **PRICE-05
**: La card de recomendación muestra el indicador "Mejor relación proteína/precio" cuando el producto es top-scored por eficiencia

### Contexto de Comida (Feature 2c)

- [ ] **MEAL-01**: La tabla de productos en Supabase tiene columna `meal_context: text` (enum: 'any', 'breakfast', 'lunch', 'dinner')
- [ ] **MEAL-02**: El tipo `Product` incluye `mealContext: 'any' | 'breakfast' | 'lunch' | 'dinner'`
- [ ] **MEAL-03**: El mapper de Supabase mapea `meal_context` a `mealContext`
- [ ] **MEAL-04**: El usuario puede filtrar recomendaciones por momento de comida (Desayuno, Almuerzo, Cena) desde la vista de inicio
- [ ] **MEAL-05**: La función `recommend()` acepta parámetro opcional `mealContext` y prioriza productos con `mealContext === mealContext || mealContext === 'any'`
- [ ] **MEAL-06**: Filtrar por momento actualiza las recomendaciones en tiempo real sin navegación

### Ampliación de Base de Datos (Feature 3)

- [ ] **DB-01**: Se agregan ≥30 productos nuevos a la tabla `products` en Supabase con `dietary_tags` y `meal_context` completos
- [ ] **DB-02**: Los nuevos productos cubren: opciones veganas (tofu, tempeh, proteína vegetal, leche de almendras), sin gluten (quinoa, arroz integral, pasta sin gluten), snacks y desayuno (avena, granola, huevos, fruta), rango de precios variado
- [ ] **DB-03**: Los productos existentes en la BD tienen asignados `dietary_tags` y `meal_context` con valores apropiados (migración de UPDATE)

---

## v2 Requirements

### Calidad de Código

- **QUAL-01**: Tests unitarios para `computeCartTotals`, `computeProgress`, `findOverages`
- **QUAL-02**: Tests unitarios para `recommend()` con todas sus variantes
- **QUAL-03**: Extraer `order-service.ts`, `goals-service.ts`, `favorites-service.ts` para eliminar DDD violations en page components
- **QUAL-04**: Validar `MacroGoalsSchema` en `editar-metas` y `onboarding` antes de guardar
- **QUAL-05**: Fix `setSaving` never resets on payment error en `carrito/page.tsx`

### Features Futuras

- **FEAT-01**: Distribución automática de metas entre 3 momentos del día (33%/34%/33%)
- **FEAT-02**: Notificaciones de órdenes recurrentes
- **FEAT-03**: Integración real de Wompi para pagos
- **FEAT-04**: Página de configuración general

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Integración Wompi real | Fuera del alcance de nutrición; deuda técnica separada |
| Tests unitarios del código existente | Sprint de calidad posterior |
| Notificaciones push | Infraestructura no existe; demasiado scope |
| Distribución automática 33%/33%/33% entre comidas | Opcional, va a v2 si hay tiempo |
| Condiciones de salud más allá de restricciones | Médico/clínico, MVP primero |
| Página de configuración general | No relacionada con nutrición |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 1 | Pending |
| FIX-02 | Phase 1 | Complete (01-03) |
| FIX-03 | Phase 1 | Pending |
| PERIOD-01 | Phase 1 | Pending |
| PERIOD-02 | Phase 1 | Pending |
| PERIOD-03 | Phase 1 | Pending |
| PERIOD-04 | Phase 1 | Pending |
| PERIOD-05 | Phase 1 | Pending |
| PERIOD-06 | Phase 1 | Pending |
| PERIOD-07 | Phase 1 | Pending |
| PERIOD-08 | Phase 1 | Pending |
| DIET-01 | Phase 2 | Pending |
| DIET-02 | Phase 2 | Pending |
| DIET-03 | Phase 2 | Pending |
| DIET-04 | Phase 2 | Pending |
| DIET-05 | Phase 2 | Pending |
| DIET-06 | Phase 2 | Pending |
| DIET-07 | Phase 2 | Pending |
| DIET-08 | Phase 2 | Pending |
| PRICE-01 | Phase 3 | Pending |
| PRICE-02 | Phase 3 | Pending |
| PRICE-03 | Phase 3 | Pending |
| PRICE-04 | Phase 3 | Pending |
| PRICE-05 | Phase 3 | Pending |
| MEAL-01 | Phase 4 | Pending |
| MEAL-02 | Phase 4 | Pending |
| MEAL-03 | Phase 4 | Pending |
| MEAL-04 | Phase 4 | Pending |
| MEAL-05 | Phase 4 | Pending |
| MEAL-06 | Phase 4 | Pending |
| DB-01 | Phase 5 | Pending |
| DB-02 | Phase 5 | Pending |
| DB-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-22*
*Last updated: 2026-04-22 after initial definition*
