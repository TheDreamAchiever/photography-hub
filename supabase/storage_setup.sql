-- 1. Create Supabase Storage Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('photos', 'photos', true, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff']),
  ('thumbnails', 'thumbnails', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies for 'photos' bucket
create policy "Public photos bucket is viewable by all"
  on storage.objects for select
  using ( bucket_id in ('photos', 'thumbnails', 'avatars') );

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check ( bucket_id in ('photos', 'thumbnails', 'avatars') and auth.role() = 'authenticated' );

create policy "Users can update own storage objects"
  on storage.objects for update
  using ( auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete own storage objects"
  on storage.objects for delete
  using ( auth.uid()::text = (storage.foldername(name))[1] );
