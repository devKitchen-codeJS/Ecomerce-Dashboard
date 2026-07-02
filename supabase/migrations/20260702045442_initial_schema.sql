create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'organization_role') then
    create type public.organization_role as enum ('owner', 'admin', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_plan') then
    create type public.billing_plan as enum ('free', 'starter', 'pro', 'enterprise');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_status') then
    create type public.billing_status as enum ('inactive', 'trialing', 'active', 'past_due', 'canceled');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_billing (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan public.billing_plan not null default 'free',
  status public.billing_status not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  store_id uuid references public.stores(id) on delete set null,
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

create index if not exists events_organization_id_idx on public.events(organization_id);
create index if not exists events_store_id_idx on public.events(store_id);
create index if not exists events_timestamp_idx on public.events(timestamp desc);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.stores enable row level security;
alter table public.organization_billing enable row level security;
alter table public.events enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Members can read organizations"
  on public.organizations
  for select
  using (
    exists (
      select 1
      from public.organization_members members
      where members.organization_id = organizations.id
        and members.user_id = auth.uid()
    )
  );

create policy "Owners can update organizations"
  on public.organizations
  for update
  using (
    exists (
      select 1
      from public.organization_members members
      where members.organization_id = organizations.id
        and members.user_id = auth.uid()
        and members.role in ('owner', 'admin')
    )
  );

create policy "Members can read memberships"
  on public.organization_members
  for select
  using (user_id = auth.uid());

create policy "Members can read stores"
  on public.stores
  for select
  using (
    exists (
      select 1
      from public.organization_members members
      where members.organization_id = stores.organization_id
        and members.user_id = auth.uid()
    )
  );

create policy "Admins can manage stores"
  on public.stores
  for all
  using (
    exists (
      select 1
      from public.organization_members members
      where members.organization_id = stores.organization_id
        and members.user_id = auth.uid()
        and members.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.organization_members members
      where members.organization_id = stores.organization_id
        and members.user_id = auth.uid()
        and members.role in ('owner', 'admin')
    )
  );

create policy "Members can read billing"
  on public.organization_billing
  for select
  using (
    exists (
      select 1
      from public.organization_members members
      where members.organization_id = organization_billing.organization_id
        and members.user_id = auth.uid()
    )
  );

create policy "Allow public read events"
  on public.events
  for select
  using (true);

create policy "Allow public insert events"
  on public.events
  for insert
  with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  organization_id uuid;
  display_name text;
begin
  display_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));

  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, display_name, new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do update
    set full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  insert into public.organizations (name, created_by)
  values (display_name || '''s Workspace', new.id)
  returning id into organization_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (organization_id, new.id, 'owner');

  insert into public.organization_billing (organization_id, plan, status)
  values (organization_id, 'free', 'inactive');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter publication supabase_realtime add table public.events;
