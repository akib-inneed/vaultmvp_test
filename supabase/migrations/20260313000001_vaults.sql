create table vaults (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('family', 'shared')) not null,
  created_at timestamptz default now()
);

create table vault_members (
  id uuid primary key default gen_random_uuid(),
  vault_id uuid references vaults on delete cascade,
  email text not null,
  added_at timestamptz default now()
);

alter table vaults enable row level security;
alter table vault_members enable row level security;

create policy "owners manage vaults" on vaults for all using (auth.uid() = owner_id);
create policy "owners manage members" on vault_members for all using (
  exists (select 1 from vaults where id = vault_id and owner_id = auth.uid())
);
