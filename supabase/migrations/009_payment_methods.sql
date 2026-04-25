-- 009 — Capture payment method + transaction reference for simulated checkout.
-- The original schema anticipated a Wompi integration via `wompi_transaction_id`;
-- we leave that column intact for future real-provider work and add a generic
-- `transaction_ref` plus method-specific metadata for the simulator.

alter table public.orders
  add column if not exists payment_method text
    check (payment_method in ('card', 'nequi', 'daviplata', 'breb', 'cash')),
  add column if not exists transaction_ref text,
  add column if not exists payment_meta jsonb;

create index if not exists orders_payment_method_idx
  on public.orders (payment_method)
  where payment_method is not null;
