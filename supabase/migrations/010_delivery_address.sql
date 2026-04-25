-- 010 — Capture delivery location for every order, regardless of payment method.
-- Previously the delivery address was collected only by the cash form, which
-- conflated logistics with payment. Address is now part of the checkout flow
-- and applies to all methods.

alter table public.orders
  add column if not exists delivery_address text,
  add column if not exists delivery_details text,
  add column if not exists delivery_instructions text,
  add column if not exists delivery_lat numeric(10, 7),
  add column if not exists delivery_lng numeric(10, 7),
  add column if not exists delivery_speed text
    check (delivery_speed in ('standard', 'fast'));
