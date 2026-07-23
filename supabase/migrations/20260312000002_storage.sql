-- ============================================================
-- Vault MVP — Supabase Storage: item-photos bucket
-- ============================================================

-- Create the bucket (public so photo URLs work in <img> tags without signed URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-photos',
  'item-photos',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Storage policies use storage.objects table
-- Path convention: {owner_id}/{filename}

-- Authenticated users can upload to their own folder
create policy "item-photos: owner upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own objects
create policy "item-photos: owner update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own objects
create policy "item-photos: owner delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read (public bucket — photos display in dashboard without auth)
create policy "item-photos: public read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'item-photos');
