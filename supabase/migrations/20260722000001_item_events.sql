-- Activity events for item assignment, acknowledgment, story edits, and messages.

create table if not exists public.item_events (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  actor_id uuid null references public.profiles(id) on delete set null,
  actor_name text not null,
  actor_role text not null check (actor_role in ('owner', 'recipient', 'system')),
  type text not null check (
    type in (
      'assigned',
      'notified',
      'accepted',
      'declined',
      'story_edited',
      'message',
      'removed'
    )
  ),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists item_events_item_id_created_at_idx
  on public.item_events(item_id, created_at);

create index if not exists item_events_actor_id_idx
  on public.item_events(actor_id);

alter table public.item_events enable row level security;

drop policy if exists "item_events: owner access" on public.item_events;
create policy "item_events: owner access"
  on public.item_events
  for all
  using (
    exists (
      select 1 from public.items
      where items.id = item_events.item_id
        and items.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.items
      where items.id = item_events.item_id
        and items.owner_id = auth.uid()
    )
  );

drop policy if exists "item_events: beneficiary read" on public.item_events;
create policy "item_events: beneficiary read"
  on public.item_events
  for select
  using (
    exists (
      select 1 from public.beneficiaries
      where beneficiaries.item_id = item_events.item_id
        and lower(beneficiaries.email) = lower(coalesce(auth.email(), ''))
    )
  );

drop policy if exists "item_events: beneficiary message insert" on public.item_events;
create policy "item_events: beneficiary message insert"
  on public.item_events
  for insert
  with check (
    actor_id = auth.uid()
    and actor_role = 'recipient'
    and type = 'message'
    and exists (
      select 1 from public.beneficiaries
      where beneficiaries.item_id = item_events.item_id
        and lower(beneficiaries.email) = lower(coalesce(auth.email(), ''))
    )
  );

grant select, insert, update, delete
on table public.item_events
to authenticated, service_role;

do $$
begin
  if exists (
    select 1 from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'item_events'
  ) then
    alter publication supabase_realtime add table public.item_events;
  end if;
end $$;

notify pgrst, 'reload schema';
