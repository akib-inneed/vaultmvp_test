-- ============================================================
-- Questions Table
-- ============================================================

create table if not exists public.questions (
    id uuid primary key default gen_random_uuid(),

    firm_id uuid not null
        references public.firms(id)
        on delete cascade,

    from_name text not null,
    from_email text not null,
    body text not null,

    related_client_id uuid
        references public.profiles(id)
        on delete set null,

    relationship text,

    status text not null default 'new',

    created_at timestamptz not null default now(),

    constraint questions_relationship_check
        check (
            relationship is null
            or relationship in ('client', 'recipient')
        ),

    constraint questions_status_check
        check (
            status in ('new', 'handled')
        )
);



-- ============================================================
-- Indexes
-- ============================================================


-- Find all questions routed to a firm
create index if not exists idx_questions_firm_id
on public.questions (firm_id);

-- Find questions connected to a client
create index if not exists idx_questions_related_client_id
on public.questions (related_client_id);

-- Filter questions by status
create index if not exists idx_questions_status
on public.questions (status);

-- Useful for fetching a firm's new or handled questions
create index if not exists idx_questions_firm_status
on public.questions (firm_id, status);

-- Useful for displaying questions newest first
create index if not exists idx_questions_created_at
on public.questions (created_at desc);