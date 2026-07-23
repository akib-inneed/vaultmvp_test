-- Fix token default: base64url is not supported by Postgres encode()
-- Switch to hex encoding (64-char URL-safe string)
alter table public.acknowledgments
  alter column token set default encode(gen_random_bytes(32), 'hex');
