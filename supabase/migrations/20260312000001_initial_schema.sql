-- ============================================================
-- Vault MVP — Initial Schema
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- Items
create table if not exists public.items (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  description      text not null default '',
  estimated_value  numeric(12,2),
  photo_url        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Beneficiaries
create table if not exists public.beneficiaries (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.items(id) on delete cascade,
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  priority    text not null check (priority in ('primary', 'secondary')),
  created_at  timestamptz not null default now()
);

-- Acknowledgments
create table if not exists public.acknowledgments (
  id               uuid primary key default gen_random_uuid(),
  beneficiary_id   uuid not null references public.beneficiaries(id) on delete cascade,
  item_id          uuid not null references public.items(id) on delete cascade,
  status           text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  notified_at      timestamptz not null default now(),
  acknowledged_at  timestamptz,
  token            text not null unique default encode(gen_random_bytes(32), 'hex')
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists items_owner_id_idx on public.items(owner_id);
create index if not exists beneficiaries_item_id_idx on public.beneficiaries(item_id);
create index if not exists beneficiaries_owner_id_idx on public.beneficiaries(owner_id);
create index if not exists acknowledgments_token_idx on public.acknowledgments(token);
create index if not exists acknowledgments_beneficiary_id_idx on public.acknowledgments(beneficiary_id);

-- ============================================================
-- updated_at trigger for items
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger items_updated_at
  before update on public.items
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.acknowledgments enable row level security;

-- Profiles: users can only read/write their own profile
create policy "profiles: owner access"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Items: users can only access their own items
create policy "items: owner access"
  on public.items
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Beneficiaries: users can only access their own beneficiaries
create policy "beneficiaries: owner access"
  on public.beneficiaries
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Acknowledgments: owner can read/write their own acknowledgments
create policy "acknowledgments: owner read"
  on public.acknowledgments
  for select
  using (
    exists (
      select 1 from public.items
      where items.id = acknowledgments.item_id
        and items.owner_id = auth.uid()
    )
  );

create policy "acknowledgments: owner insert"
  on public.acknowledgments
  for insert
  with check (
    exists (
      select 1 from public.items
      where items.id = acknowledgments.item_id
        and items.owner_id = auth.uid()
    )
  );

create policy "acknowledgments: owner update"
  on public.acknowledgments
  for update
  using (
    exists (
      select 1 from public.items
      where items.id = acknowledgments.item_id
        and items.owner_id = auth.uid()
    )
  );

-- Acknowledgments: recipients can read and update via token (no auth required)
-- This is handled via a service role in the API route for /acknowledge/[token]
-- Public read by token (unauthenticated) is done server-side with service role key

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
