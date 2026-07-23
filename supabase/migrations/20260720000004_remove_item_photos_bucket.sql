-- Remove the legacy public image bucket.
-- The app now uses the private item-images bucket for /items/new uploads.

drop policy if exists "item-photos: owner upload" on storage.objects;
drop policy if exists "item-photos: owner update" on storage.objects;
drop policy if exists "item-photos: owner delete" on storage.objects;
drop policy if exists "item-photos: public read" on storage.objects;

do $$
begin
  delete from storage.buckets
  where id = 'item-photos'
    and not exists (
      select 1
      from storage.objects
      where objects.bucket_id = 'item-photos'
    );
exception
  when others then
    raise notice 'Could not delete legacy item-photos bucket from storage metadata: %', sqlerrm;
end $$;
