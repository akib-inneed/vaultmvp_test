-- ============================================================
-- Client Invites
-- ============================================================

create table if not exists public.client_invites (
    id uuid primary key default gen_random_uuid(),

    firm_id uuid not null
        references public.firms(id)
        on delete cascade,

    invited_by uuid not null  --for the attorney who sent the invite
        references public.profiles(id)
        on delete set null, 

    client_name text not null,
    client_email text not null,
    client_phone text,

    token text not null unique,

    status text not null default 'sent'
        check (status in ('sent', 'opened', 'claimed', 'revoked')),

    sent_at timestamptz not null default now(),
    claimed_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_client_invites_firm_id
    on public.client_invites (firm_id);

create index if not exists idx_client_invites_invited_by
    on public.client_invites (invited_by);

create index if not exists idx_client_invites_client_email
    on public.client_invites (client_email);

create index if not exists idx_client_invites_status
    on public.client_invites (status);

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace trigger client_invites_updated_at
    before update on public.client_invites
    for each row
    execute function public.handle_updated_at();