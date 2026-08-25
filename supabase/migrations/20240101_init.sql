-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- 1. PROFILES TABLE (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  website text,
  instagram text,
  twitter text,
  gear_list text[] default '{}',
  role text default 'viewer' check (role in ('viewer', 'photographer', 'admin')),
  storage_quota_mb int default 1024,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ALBUMS TABLE
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  visibility text default 'public' check (visibility in ('public', 'unlisted', 'private')),
  cover_photo_id uuid,
  category text default 'General',
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PHOTOS TABLE
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  album_id uuid references public.albums(id) on delete set null,
  title text,
  storage_path text not null,
  thumbnail_path text,
  caption text,
  ai_tags text[] default '{}',
  ai_description text,
  ai_critique jsonb,
  exif jsonb default '{}'::jsonb,
  camera_make text,
  camera_model text,
  lens text,
  focal_length text,
  aperture text,
  shutter_speed text,
  iso int,
  width int,
  height int,
  color_palette text[] default '{}',
  aspect_ratio text default '3:2',
  category text default 'Landscape',
  location text,
  is_public boolean default true,
  price numeric default 0,
  views_count int default 0,
  likes_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Foreign key reference for album cover
alter table public.albums 
  drop constraint if exists fk_cover_photo;
alter table public.albums
  add constraint fk_cover_photo 
  foreign key (cover_photo_id) 
  references public.photos(id) 
  on delete set null;

-- 4. PHOTO EMBEDDINGS (For pgvector semantic search)
create table if not exists public.photo_embeddings (
  photo_id uuid references public.photos(id) on delete cascade primary key,
  embedding vector(768),
  updated_at timestamptz default now()
);

-- Index on embeddings for cosine distance search
create index if not exists photo_embeddings_vector_idx 
  on public.photo_embeddings 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 5. LIKES TABLE
create table if not exists public.likes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  photo_id uuid references public.photos(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, photo_id)
);

-- 6. FOLLOWS TABLE
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  constraint cant_follow_self check (follower_id <> following_id)
);

-- 7. COMMENTS TABLE
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- 8. COLLECTIONS / BOOKMARKS TABLE
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Favorites',
  is_private boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.collection_items (
  collection_id uuid references public.collections(id) on delete cascade not null,
  photo_id uuid references public.photos(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (collection_id, photo_id)
);

-- 9. ANALYTICS EVENTS TABLE
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null, -- 'upload', 'view', 'like', 'search', 'critique', 'download', 'purchase'
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.photo_embeddings enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.events enable row level security;

-- Profiles: Public read, owner update
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Albums: Public/Unlisted viewable, Private owner only
create policy "Public albums are viewable by everyone" on public.albums
  for select using (visibility in ('public', 'unlisted') or auth.uid() = owner_id);

create policy "Users can manage own albums" on public.albums
  for all using (auth.uid() = owner_id);

-- Photos: Public photos viewable by everyone, owners have full access
create policy "Public photos are viewable by everyone" on public.photos
  for select using (is_public = true or auth.uid() = owner_id);

create policy "Users can insert own photos" on public.photos
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own photos" on public.photos
  for update using (auth.uid() = owner_id);

create policy "Users can delete own photos" on public.photos
  for delete using (auth.uid() = owner_id);

-- Photo Embeddings: Read by public, write by owner/service
create policy "Photo embeddings readable by everyone" on public.photo_embeddings
  for select using (true);

create policy "Photo embeddings manageable by service role" on public.photo_embeddings
  for all using (true);

-- Likes: Public read, authenticated users can insert/delete own
create policy "Likes are viewable by everyone" on public.likes
  for select using (true);

create policy "Authenticated users can like photos" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can remove their own likes" on public.likes
  for delete using (auth.uid() = user_id);

-- Follows: Public read, authenticated users can manage
create policy "Follows viewable by everyone" on public.follows
  for select using (true);

create policy "Authenticated users can follow" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "Authenticated users can unfollow" on public.follows
  for delete using (auth.uid() = follower_id);

-- Comments: Public read, authenticated users can post & delete own
create policy "Comments viewable by everyone" on public.comments
  for select using (true);

create policy "Authenticated users can add comments" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- Collections: Owner access
create policy "Users can view own collections" on public.collections
  for select using (auth.uid() = user_id or is_private = false);

create policy "Users can manage own collections" on public.collections
  for all using (auth.uid() = user_id);

create policy "Users can manage own collection items" on public.collection_items
  for all using (
    exists (
      select 1 from public.collections
      where collections.id = collection_items.collection_id
      and collections.user_id = auth.uid()
    )
  );

-- Events: Anyone can insert, admins can read
create policy "Anyone can log events" on public.events
  for insert with check (true);

create policy "Admins can view events" on public.events
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- TRIGGER: Auto-create profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
    coalesce(new.raw_user_meta_data->>'role', 'photographer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC: Semantic Vector Search Function
create or replace function public.match_photos(
  query_embedding vector(768),
  match_threshold float default 0.3,
  match_count int default 20
)
returns table (
  id uuid,
  owner_id uuid,
  title text,
  caption text,
  ai_description text,
  ai_tags text[],
  storage_path text,
  thumbnail_path text,
  camera_model text,
  similarity float
)
language sql stable as $$
  select
    p.id,
    p.owner_id,
    p.title,
    p.caption,
    p.ai_description,
    p.ai_tags,
    p.storage_path,
    p.thumbnail_path,
    p.camera_model,
    1 - (pe.embedding <=> query_embedding) as similarity
  from public.photo_embeddings pe
  join public.photos p on p.id = pe.photo_id
  where 1 - (pe.embedding <=> query_embedding) > match_threshold
    and p.is_public = true
  order by similarity desc
  limit match_count;
$$;
