-- ============================================================================
-- Macroly - Initial schema
-- Tables: profiles, macro_goals, categories, products, articles, orders,
--         recurring_orders, favorite_combos
-- ============================================================================

-- Profiles extend auth.users (Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create profile + default macro goals when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  insert into public.macro_goals (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- A1: Macro nutritional goals
-- ============================================================================
create table public.macro_goals (
  user_id uuid primary key references public.profiles on delete cascade,
  protein int not null default 150 check (protein between 50 and 300),
  carbs int not null default 250 check (carbs between 100 and 500),
  fat int not null default 65 check (fat between 20 and 150),
  calories int generated always as (protein * 4 + carbs * 4 + fat * 9) stored,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Catalog: categories + products
-- ============================================================================
create table public.categories (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  weight text,
  image_url text,
  price int not null check (price >= 0),
  protein int not null default 0 check (protein >= 0),
  carbs int not null default 0 check (carbs >= 0),
  fat int not null default 0 check (fat >= 0),
  calories int not null default 0 check (calories >= 0),
  category_id text references public.categories,
  rating numeric(2, 1) check (rating between 0 and 5),
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_protein_idx on public.products (protein desc);

-- ============================================================================
-- A6: Educational articles
-- ============================================================================
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  tag text,
  reading_time int,
  icon text,
  content jsonb not null,
  related_product_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- A5: Orders
-- ============================================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  items jsonb not null,
  total_protein int not null default 0,
  total_carbs int not null default 0,
  total_fat int not null default 0,
  total_calories int not null default 0,
  total_price int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'delivered', 'failed')),
  wompi_transaction_id text,
  created_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);

-- ============================================================================
-- A5: Recurring orders (multi-day)
-- ============================================================================
create table public.recurring_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles on delete cascade,
  items jsonb not null,
  days text[] not null check (array_length(days, 1) > 0),
  active boolean not null default true,
  next_delivery date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- A7: Favorite product combinations
-- ============================================================================
create table public.favorite_combos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  items jsonb not null,
  total_protein int not null default 0,
  total_carbs int not null default 0,
  total_fat int not null default 0,
  total_calories int not null default 0,
  total_price int not null default 0,
  created_at timestamptz not null default now()
);

create index favorite_combos_user_idx on public.favorite_combos (user_id, created_at desc);
