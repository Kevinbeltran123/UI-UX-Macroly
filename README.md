# Macroly — Nutricion inteligente

App web de compra de productos alimenticios con tracking de macronutrientes en tiempo real. Proyecto UI/UX — Universidad de Ibague, 2026.

## Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Supabase (Postgres + Auth + RLS)
- **State:** Zustand (carrito con persistencia localStorage)
- **Icons:** Lucide React
- **PWA:** Manifest + iconos SVG, instalable en mobile

## Acciones de usuario

| # | Accion | Ruta |
|---|--------|------|
| A1 | Configurar perfil nutricional | `/onboarding`, `/perfil/editar-metas` |
| A2 | Explorar catalogo con filtros | `/catalogo` |
| A3 | Agregar al carrito con progreso real-time | `/catalogo/[id]`, `/carrito` |
| A4 | Recomendaciones inteligentes | `/inicio` |
| A5 | Compra recurrente semanal | `/carrito` (checkout modal) |
| A6 | Contenido educativo | `/educacion`, `/educacion/[slug]` |
| A7 | Guardar combinaciones favoritas | `/carrito`, `/perfil/favoritos` |

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/Kevinbeltran123/UI-UX-Macroly.git
cd UI-UX-Macroly
npm install
```

### 2. Variables de entorno

Copiar `.env.local.example` a `.env.local` y completar con tus credenciales de Supabase:

```bash
cp .env.local.example .env.local
```

Las variables necesarias:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 3. Base de datos

Crear un proyecto en [supabase.com](https://supabase.com) y aplicar las migraciones en orden desde el SQL Editor:

1. `supabase/migrations/001_init_schema.sql` — Tablas y triggers
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security
3. `supabase/migrations/003_seed_catalog.sql` — 12 productos + categorias
4. `supabase/migrations/004_seed_articles.sql` — 6 articulos educativos

### 4. Configurar Auth

En el dashboard de Supabase:
- **Authentication > Providers > Email:** desactivar "Confirm email"
- **(Opcional) Google OAuth:** habilitar en Providers y configurar OAuth credentials

### 5. Correr

```bash
npm run dev
```

Abrir `http://localhost:3000` — redirige a `/login`.

## Estructura del proyecto

```
src/
  app/              # Next.js App Router (13 rutas)
    (auth)/          # Login, registro, onboarding
    (app)/           # App protegida con BottomNav
  domain/            # Logica de negocio pura (sin React)
    nutrition/       # Macros, metas, calorias
    catalog/         # Producto, filtros, busqueda
    cart/            # Operaciones + totales
    recommendation/  # Algoritmo gap-based scoring
    orders/          # Pedidos + recurrencia multi-dia
    favorites/       # Combos guardados
    education/       # Articulos
  components/        # React components por dominio
    layout/          # Logo, BottomNav
    nutrition/       # MacroBar, MacroChip
    product/         # ProductCard, MacroFilterChips
    ui/              # Skeleton, Toast, EmptyState
  stores/            # Zustand (cart, toasts)
  hooks/             # useCart
  lib/               # Supabase clients, utils
supabase/
  migrations/        # SQL schema + seeds
prototipo-legacy/    # Prototipo original HTML (referencia)
docs/                # Documentos del avance 1 y 2
```

## Design system

| Token | Valor |
|-------|-------|
| Primary dark | `#1B5E20` |
| Primary | `#2E7D32` |
| Primary mid | `#43A047` |
| Proteina | `#43A047` (verde) |
| Carbohidratos | `#FB8C00` (naranja) |
| Grasas | `#1E88E5` (azul) |
| Calorias | `#8B5CF6` (morado) |
| Font display | Nunito (700/800/900) |
| Font body | Inter (400/500/600) |

## Build

```bash
npm run build
npm start
```

## Autores

- Kevin Beltran — Universidad de Ibague, Semestre IX, 2026
- Juan Perea — Universidad de Ibague, Semestre IX, 2026
