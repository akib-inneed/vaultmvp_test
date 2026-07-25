-- ============================================================
-- Create item-images storage bucket
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'item-images',
  'item-images',
  false,
  10485760, -- 10 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- Storage policies
-- ============================================================

drop policy if exists "item-images: owner read" on storage.objects;
drop policy if exists "item-images: owner upload" on storage.objects;
drop policy if exists "item-images: owner update" on storage.objects;
drop policy if exists "item-images: owner delete" on storage.objects;

create policy "item-images: owner read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "item-images: owner upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "item-images: owner update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "item-images: owner delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);