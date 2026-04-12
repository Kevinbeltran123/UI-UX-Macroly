# Prototipo Legacy - Macroly

Esta carpeta contiene el **prototipo original** de Macroly que sirve como referencia visual y de UX durante la migracion al MVP funcional con Next.js + Supabase.

## Contenido

- `src/macroly-completo.html` — Prototipo interactivo completo (React + Babel inline). Demuestra las 7 acciones simuladas con Desktop y Mobile.
- `src/pantallas/` — 12 mockups individuales HTML/CSS por pantalla, listos para importar a Figma con `html.to.design`.
- `src/generate-avance2.js` — Script que genera los mockups del avance 2.

## Por que se conserva

1. **Referencia visual** — el diseno final del prototipo es la fuente de verdad para la migracion.
2. **Logica probada** — funciones como `getRecommendations()`, `addToCart()`, calculo de macros y filtros ya estan validadas y se migraran al `domain layer`.
3. **Datos seed** — los 12 productos y articulos del prototipo se usaran como seed inicial de Supabase.

## Como usarlo

Abre `src/macroly-completo.html` en cualquier navegador (no requiere build):

```bash
open prototipo-legacy/src/macroly-completo.html
```

## Mapeo a la app real

Cada pantalla del prototipo corresponde a una ruta en la app Next.js:

| Prototipo | Ruta Next.js | Accion |
|-----------|--------------|--------|
| `01-login.html` | `/(auth)/login` | Pre-app |
| `02-onboarding.html` | `/(auth)/onboarding` | A1 |
| `03-inicio.html` | `/(app)/inicio` | A4 |
| `04-catalogo.html` | `/(app)/catalogo` | A2 |
| `05-detalle-producto.html` | `/(app)/catalogo/[id]` | A3 |
| `06-carrito.html` | `/(app)/carrito` | A3, A4, A7 |
| `07-checkout.html` | `(modal)` | A5, A7 |
| `08-educacion.html` | `/(app)/educacion` | A6 |
| `09-articulo.html` | `/(app)/educacion/[slug]` | A6 |
| `10-perfil.html` | `/(app)/perfil` | A1, A5 |
| `11-historial.html` | `/(app)/perfil/historial` | A5 |
| `12-favoritos.html` | `/(app)/perfil/favoritos` | A7 |
