-- ============================================================
-- Vault MVP — Schema for Firms
-- ============================================================

-- Firms 
create table if not exists public.firms (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    logo_url text,
    replay_to_email text,
    created_at timestamptz default now(),
    update_at timestamptz default now()
);

-- Firm Members
create table if not exists public.firm_members (
    id uuid primary key default gen_random_uuid(),
    firm_id uuid references public.firms on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);



-- ============================================================
-- Indexes
-- ============================================================

-- Index for finding members belonging to a firm
create index if not exists idx_firm_members_firm_id
on public.firm_members (firm_id);

-- Index for finding firms associated with a user
create index if not exists idx_firm_members_user_id
on public.firm_members (user_id);

-- Prevent the same user from being added to the same firm more than once
create unique index if not exists idx_firm_members_firm_user_unique
on public.firm_members (firm_id, user_id);


-- ============================================================
-- updated_at trigger 
-- ============================================================

create or replace trigger firms_updated_at
  before update on public.firms
  for each row execute procedure public.handle_updated_at();

create or replace trigger firm_members_updated_at
  before update on public.firm_members
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
--alter table public.firms enable row level security;
--alter table public.firm_members enable row level security;

-- for now we are not implementing any row level security policies for firms and firm_members, but we can add them later if needed