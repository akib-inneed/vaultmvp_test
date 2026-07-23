GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.firms
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.firm_members
TO authenticated;


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.client_invites
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.questions
TO authenticated;