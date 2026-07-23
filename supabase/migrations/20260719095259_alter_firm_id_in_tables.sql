ALTER TABLE public.profiles
ADD COLUMN role text
CHECK (role IN ('admin', 'attorney', 'user'));

alter table public.profiles 
add column if not exists firm_id uuid 
references public.firms on delete set null;

alter table public.profiles
add column shared_with_firms_at timestamptz;
