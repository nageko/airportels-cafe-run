-- AIRPORTELS Cafe Run — Supabase schema.
-- Run this once in the Supabase SQL editor.

create table if not exists public.staff (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  room        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id          uuid primary key,
  code        text not null,
  staff_name  text not null,
  room        text,
  note        text,
  status      text not null default 'queued' check (status in ('queued','brewing','delivered')),
  created_at  timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);

create table if not exists public.order_items (
  id          bigserial primary key,
  order_id    uuid references public.orders(id) on delete cascade,
  drink_id    text,
  name        text not null,
  size        text,
  sugar       text,
  ice         text,
  milk        text,
  temp        text,
  qty         int  not null default 1,
  price       numeric(10,2) not null default 0,
  item_note   text
);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- Internal-use prototype: open RLS to the anon key.
-- For production, gate with auth.uid() or a shared internal JWT.
alter table public.staff       enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

create policy "anon read staff"        on public.staff       for select using (true);
create policy "anon insert staff"      on public.staff       for insert with check (true);
create policy "anon read orders"       on public.orders      for select using (true);
create policy "anon insert orders"     on public.orders      for insert with check (true);
create policy "anon update orders"     on public.orders      for update using (true);
create policy "anon delete orders"     on public.orders      for delete using (true);
create policy "anon read items"        on public.order_items for select using (true);
create policy "anon insert items"      on public.order_items for insert with check (true);
create policy "anon update items"      on public.order_items for update using (true);
create policy "anon delete items"      on public.order_items for delete using (true);
