create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (
    type in (
      'page_view',
      'product_view',
      'add_to_cart',
      'checkout_started',
      'purchase'
    )
  ),
  timestamp timestamptz not null default now(),
  session_id text not null,
  product_id text,
  value numeric,
  meta jsonb not null default '{}'::jsonb
);

alter table public.events enable row level security;

create policy "Allow public read events"
  on public.events
  for select
  using (true);

create policy "Allow public insert events"
  on public.events
  for insert
  with check (true);

alter publication supabase_realtime add table public.events;
