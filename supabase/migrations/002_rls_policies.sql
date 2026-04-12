-- ============================================================================
-- Row Level Security Policies
-- Pattern: each user only accesses their own rows. Catalog (products,
--          categories, articles) is publicly readable to authenticated users.
-- ============================================================================

-- Profiles
alter table public.profiles enable row level security;

create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- Macro goals
alter table public.macro_goals enable row level security;

create policy "goals all own" on public.macro_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Categories: public read, no writes from clients
alter table public.categories enable row level security;

create policy "categories public read" on public.categories
  for select to authenticated using (true);

-- Products: public read
alter table public.products enable row level security;

create policy "products public read" on public.products
  for select to authenticated using (true);

-- Articles: public read
alter table public.articles enable row level security;

create policy "articles public read" on public.articles
  for select to authenticated using (true);

-- Orders
alter table public.orders enable row level security;

create policy "orders all own" on public.orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Recurring orders
alter table public.recurring_orders enable row level security;

create policy "recurring all own" on public.recurring_orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Favorite combos
alter table public.favorite_combos enable row level security;

create policy "favorites all own" on public.favorite_combos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
