-- Grant API access to the core vault tables.
-- RLS policies still enforce row-level ownership and recipient access.

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.firms
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.firm_members
TO authenticated;


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.client_invites
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.questions
TO authenticated;

grant select, insert, update, delete
on table public.items
to authenticated;

grant select, insert, update, delete
on table public.beneficiaries
to authenticated;

grant select, insert, update, delete
on table public.acknowledgments
to authenticated;

grant select, insert, update, delete
on table public.vaults
to authenticated;

grant select, insert, update, delete
on table public.vault_members
to authenticated;

-- Server actions use the Supabase service-role client for cross-table vault flows.

grant select, insert, update, delete
on table public.items
to service_role;

grant select, insert, update, delete
on table public.beneficiaries
to service_role;

grant select, insert, update, delete
on table public.acknowledgments
to service_role;

grant select, insert, update, delete
on table public.item_events
to service_role;

notify pgrst, 'reload schema';

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.acknowledgments DISABLE ROW LEVEL SECURITY;