# Supabase setup

## Migraciones

Las migraciones estan en `migrations/` y deben aplicarse en orden:

| # | Archivo | Que hace |
|---|---------|----------|
| 001 | `001_init_schema.sql` | Crea tablas, trigger de signup, indices |
| 002 | `002_rls_policies.sql` | Habilita RLS y crea policies por usuario |
| 003 | `003_seed_catalog.sql` | Inserta categorias + 12 productos seed |
| 004 | `004_seed_articles.sql` | Inserta 6 articulos educativos + relaciones |

## Como aplicar (cloud)

1. Crear proyecto en https://supabase.com (free tier)
2. Ir a **SQL Editor** del dashboard
3. Pegar el contenido de cada archivo y ejecutar **en orden**
4. Verificar en **Table Editor** que existen las tablas: `profiles`, `macro_goals`, `categories`, `products`, `articles`, `orders`, `recurring_orders`, `favorite_combos`
5. Copiar las credenciales desde **Project Settings > API**:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY` (solo server-side, NUNCA en cliente)

## Como aplicar (CLI local opcional)

```bash
npx supabase init
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

## Generar tipos TypeScript

```bash
npx supabase gen types typescript --project-id <tu-project-id> > src/types/database.ts
```

Esto genera tipos para usar con `createClient<Database>()`.

## Auth: configurar Google OAuth

1. Ir a **Authentication > Providers** en Supabase dashboard
2. Habilitar **Google**
3. Crear OAuth credentials en https://console.cloud.google.com:
   - Tipo: Web application
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copiar Client ID y Client Secret a Supabase
5. Listo: el boton "Continuar con Google" funcionara con `signInWithOAuth({ provider: 'google' })`

## Verificar RLS

En SQL Editor:

```sql
-- Listar policies por tabla
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Probar una policy: deberia retornar solo las metas del usuario actual
select * from macro_goals;
```
