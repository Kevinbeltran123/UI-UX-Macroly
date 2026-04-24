# Macroly — Smart Nutrition Shopping (Feature Expansion)

## What This Is

Macroly es una PWA mobile-first de compras de nutrición que ayuda a usuarios a alcanzar sus metas de macronutrientes. Los usuarios arman un carrito de productos, ven su progreso hacia las metas diarias de proteína/carbohidratos/grasa, y reciben recomendaciones personalizadas. Esta expansión corrige problemas lógicos fundamentales (período de compra, metas de usuario ignoradas, carrito sin TTL) y agrega restricciones dietéticas, optimización de precio por macro, contexto de comida, y una base de datos de productos ampliada.

## Core Value

Un usuario debe poder armar un carrito para N días, ver exactamente cuánto cubre sus metas de macros para ese período, y recibir recomendaciones que respeten sus restricciones dietéticas y presupuesto.

## Requirements

### Validated

<!-- Lo que ya existe y funciona en producción -->

- ✓ Autenticación con email/contraseña y Google OAuth — existente
- ✓ Onboarding con configuración de metas de macros (MacroGoals) — existente
- ✓ Catálogo de productos con filtros de categoría — existente
- ✓ Carrito con totales de macros (CartTotals) — existente
- ✓ Progreso de macros con barras de progreso — existente (lógica incorrecta)
- ✓ Compatibilidad de productos ("fits" / "tight" / "exceeds") — existente (lógica incorrecta)
- ✓ Motor de recomendaciones gap-based — existente (limitado)
- ✓ Órdenes recurrentes con días de entrega — existente (sin período)
- ✓ Combos favoritos — existente
- ✓ Artículos educativos — existente
- ✓ PWA con service worker, iconos, manifest — existente
- ✓ Perfil con edición de metas — existente

### Validated

<!-- Validados en Phase 1 (2026-04-22) -->

- ✓ Usuario puede seleccionar período de compra (1, 2, 3, 5, 7 días) desde carrito e inicio — Validated in Phase 1: Purchase Period + Core Bug Fixes
- ✓ Todas las metas de macros se calculan como `meta_diaria × días_seleccionados` — Validated in Phase 1
- ✓ El progreso de macros, compatibilidad y recomendaciones usan las metas ajustadas al período — Validated in Phase 1
- ✓ El período de compra se persiste en el store de Zustand — Validated in Phase 1
- ✓ El carrito se resetea automáticamente cuando cambia la fecha (TTL diario) — Validated in Phase 1
- ✓ Las metas reales del usuario (desde Supabase) se pasan correctamente a `useCart(goals)` — Validated in Phase 1

### Validated

<!-- Validados en Phase 2 (2026-04-23) -->

- ✓ El perfil del usuario puede marcar restricciones dietéticas: vegano, sin gluten, sin lactosa, sin mariscos, alto en proteína — Validated in Phase 2: Dietary Restrictions
- ✓ Las restricciones se guardan en Supabase en el perfil del usuario — Validated in Phase 2
- ✓ El motor de recomendaciones filtra productos incompatibles con las restricciones antes de calcular el score — Validated in Phase 2
- ✓ Los productos tienen tags de restricciones en la base de datos — Validated in Phase 2

### Validated

<!-- Validados en Phase 3 (2026-04-23) -->

- ✓ El usuario puede setear un presupuesto máximo de compra — Validated in Phase 3: Price Optimization
- ✓ Las recomendaciones priorizan eficiencia nutricional por precio cuando hay presupuesto seteado — Validated in Phase 3
- ✓ La card de recomendación muestra "Mejor relación proteína/precio" cuando aplica — Validated in Phase 3

### Validated

<!-- Validados en Phase 4 (2026-04-23) -->

- ✓ El usuario puede filtrar recomendaciones por momento de comida (Todo, Desayuno, Almuerzo, Cena) — Validated in Phase 4: Meal Context
- ✓ Los productos tienen campo `meal_context text NOT NULL DEFAULT 'any'` en la base de datos — Validated in Phase 4
- ✓ Las recomendaciones filtran por meal_context antes del scoring (restrictions → budget → meal → score) — Validated in Phase 4

### Active

<!-- Correcciones + features de esta expansión -->
- ✓ La base de datos tiene ≥30 productos nuevos con tags completos (restricciones + meal_context) — Validated in Phase 5: DB Expansion (50 products total, 38 new, filters return real results)
- [ ] Las órdenes recurrentes muestran feedback de cobertura de macros por día de entrega

### Out of Scope

- Integración real de pagos Wompi — ya existe la deuda, fuera del alcance de esta expansión
- Notificaciones push — infraestructura no existe, demasiado scope
- Página de configuración general — no relacionada con nutrición
- Condiciones de salud avanzadas (más allá de restricciones dietéticas) — MVP primero
- Tests unitarios del dominio existente — separar en sprint de calidad posterior
- Distribución automática 33%/34%/33% entre comidas — opcional, posiblemente v2

## Context

**Codebase existente:** Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Zustand + Supabase. Arquitectura DDD limpia: `domain/` (lógica pura), `stores/` (Zustand), `components/` (UI), `app/` (App Router).

**Bugs críticos ya identificados por análisis de código:**
1. `useCart()` se llama en todos lados sin pasar `goals`, usando `DEFAULT_GOALS` hardcodeados para todos los usuarios — las barras de macro son incorrectas aunque el usuario haya configurado sus metas.
2. Cart persiste en localStorage sin TTL — acumula datos de días/semanas anteriores.
3. El motor de recomendaciones puede sugerir productos ya en el carrito.
4. DDD violation: lógica de negocio en page components (carrito/page.tsx tiene mutations directas de Supabase).

**Restricción clave:** El motor de recomendaciones debe permanecer síncrono (sin APIs de IA externas). Migración de Supabase incremental (ALTER TABLE, no DROP). Mobile-first PWA.

**Archivos clave del dominio:**
- `src/domain/cart/cart-summary.ts` — `computeCartTotals`, `computeProgress`, `findOverages`
- `src/domain/recommendation/recommendation-engine.ts` — `recommend()` función principal
- `src/domain/catalog/product.ts` — tipo `Product` (necesita tags + meal_context)
- `src/domain/nutrition/macro-goals.ts` — tipo `MacroGoals` + `DEFAULT_GOALS`
- `src/stores/cart-store.ts` — Zustand con persist (necesita período + TTL)
- `src/hooks/use-cart.ts` — acepta `goals` pero nadie lo pasa

## Constraints

- **Tech stack**: Next.js 16 + React 19 + TypeScript + Tailwind v4 + Zustand + Supabase — no cambiar
- **Arquitectura**: Toda lógica de negocio en `domain/`, sin lógica en componentes — DDD estricto
- **Rutas existentes**: No romper `/inicio`, `/catalogo`, `/carrito`, `/perfil`
- **Supabase**: Solo ALTER TABLE y nuevas tablas — no DROP ni recrear esquema
- **Recomendaciones**: Motor síncrono, sin APIs de IA
- **Mobile-first**: PWA usada principalmente en móvil, safe-area, touch targets ≥44px
- **Git**: `.planning/` está en `.gitignore` — ningún archivo GSD llega al repositorio remoto

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Período de compra en store del carrito | El período es parte del contexto de compra, no del perfil — va junto con los items | ✓ Validated Phase 1 |
| Goals desde Supabase → Zustand goals store | Soluciona el bug de DEFAULT_GOALS; centraliza goals para toda la app | ✓ Validated Phase 1 |
| Tags como array de strings en producto | Flexible para múltiples restricciones, compatible con Supabase `text[]` | — Pending Phase 2 |
| Presupuesto como campo opcional en perfil | No obligatorio — el motor funciona sin él, mejora cuando está seteado | ✓ Validated Phase 3 |
| meal_context como enum en BD | Garantiza valores válidos a nivel DB; simple: 'any' \| 'breakfast' \| 'lunch' \| 'dinner' | ✓ Validated Phase 4 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
**Current State:** Phase 4 complete (2026-04-23) — meal_context DB column + CHECK constraint, Product type + mapProduct() extended, recommend() 7th param with Step 3 meal filter, MealFilterChips row in InicioClient with ARIA + Tailwind, mealContext useState wired to engine. 179 tests passing. All 4 active milestones complete.

*Last updated: 2026-04-23 after Phase 4 completion*
