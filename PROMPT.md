# Photography-Hub — Full Build Prompt

Use this as a single prompt for an AI coding assistant (Claude Code, Cursor, Bolt, v0, etc.) to scaffold the entire product.

---

## 1. Project Overview

Build **Photography-Hub**, a web platform where photographers can upload, organize, showcase, and sell their photography, with AI-powered tagging, search, and editing suggestions powered by Google Gemini.

Target users:
- **Photographers** — upload portfolios, organize into albums, get AI captions/tags, sell prints or licenses.
- **Clients/Viewers** — browse public galleries, search photos by natural language, favorite/download/purchase.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Next.js, App Router) + TypeScript + Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions, Realtime) |
| AI | Google Gemini API (multimodal — image understanding + text) |
| Hosting | Vercel (frontend) + Supabase (backend) |
| Payments (optional) | Stripe (for print/license sales) |

---

## 3. Core Features

### 3.1 Authentication
- Supabase Auth: email/password + Google OAuth.
- Roles: `photographer`, `viewer`, `admin`.
- Profile setup: display name, bio, avatar, portfolio link.

### 3.2 Photo Upload & Storage
- Drag-and-drop multi-upload to Supabase Storage buckets (`photos`, `avatars`, `thumbnails`).
- Auto-generate thumbnails/compressed previews on upload (Edge Function).
- Metadata capture: EXIF (camera, lens, ISO, aperture, shutter speed) parsed client-side.

### 3.3 AI Features (Gemini)
- **Auto-captioning**: send uploaded image to Gemini → generate a descriptive caption.
- **Auto-tagging**: Gemini returns relevant tags/keywords (subject, mood, style, color palette, location type).
- **Smart natural-language search**: user types "moody sunset portraits" → embed query, match against stored tags/captions/embeddings.
- **AI critique / improvement tips**: Gemini gives composition, lighting, and editing feedback on request.
- **Auto-alt-text** for accessibility.
- All AI calls run server-side via a Supabase Edge Function (never expose the Gemini API key client-side).

### 3.4 Albums & Portfolios
- Photographers create albums/collections (public, unlisted, or private).
- Custom portfolio page: `photography-hub.com/@username`.
- Drag-to-reorder photos within an album.

### 3.5 Discovery
- Public explore feed (infinite scroll, filter by tag/category/color).
- AI-powered search bar (natural language → matches via tags/embeddings).
- Trending/most-liked section.

### 3.6 Social & Engagement
- Likes, favorites/collections, comments.
- Follow photographers.
- Realtime notifications (Supabase Realtime) for likes/comments/follows.

### 3.7 Monetization (optional phase 2)
- Sell digital downloads or print licenses via Stripe Checkout.
- Watermarked previews for unpurchased high-res images.

### 3.8 Admin Dashboard
- Moderate flagged content.
- View platform analytics (uploads, users, storage usage).

---

## 4. Database Schema (Supabase / Postgres)

```sql
-- users profile (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  role text default 'viewer', -- viewer | photographer | admin
  created_at timestamptz default now()
);

-- albums
create table albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  visibility text default 'public', -- public | unlisted | private
  cover_photo_id uuid,
  created_at timestamptz default now()
);

-- photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  album_id uuid references albums(id) on delete set null,
  storage_path text not null,
  thumbnail_path text,
  caption text,
  ai_tags text[],
  ai_description text,
  exif jsonb,
  width int,
  height int,
  is_public boolean default true,
  price numeric,
  created_at timestamptz default now()
);

-- embeddings for semantic search
create table photo_embeddings (
  photo_id uuid references photos(id) on delete cascade primary key,
  embedding vector(768) -- pgvector extension
);

-- likes
create table likes (
  user_id uuid references profiles(id) on delete cascade,
  photo_id uuid references photos(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, photo_id)
);

-- follows
create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
```

Enable **Row Level Security (RLS)** on every table:
- `photos`: public read where `is_public = true`; owner full access.
- `albums`: same pattern based on `visibility`.
- `likes`/`comments`: authenticated users can insert/delete their own rows; public read.
- `profiles`: public read; owner-only update.

Enable the `pgvector` extension for `photo_embeddings`.

---

## 5. Supabase Edge Functions

1. **`generate-caption-tags`**
   - Input: `photo_id`, `storage_path`.
   - Fetches image from Storage → sends to Gemini (multimodal) with a prompt asking for caption, tags, and mood/style.
   - Writes results back to `photos.ai_tags` / `photos.ai_description`.

2. **`generate-embedding`**
   - Input: `photo_id`, caption + tags text.
   - Calls Gemini embedding model → stores vector in `photo_embeddings`.

3. **`semantic-search`**
   - Input: natural-language query string.
   - Embeds the query, runs a `pgvector` cosine-similarity match against `photo_embeddings`, returns ranked `photo_id`s.

4. **`ai-critique`**
   - Input: `photo_id`.
   - Sends image to Gemini with a prompt requesting composition/lighting/editing feedback.
   - Returns critique to the client (not stored, or optionally cached).

5. **`generate-thumbnail`**
   - Triggered on upload via Storage webhook.
   - Resizes/compresses image, writes to `thumbnail_path`.

Environment variables (set as Supabase secrets, never client-exposed):
```
GEMINI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 6. Frontend Pages / Routes

| Route | Purpose |
|---|---|
| `/` | Landing page + explore feed |
| `/explore` | Public gallery with filters + AI search bar |
| `/@[username]` | Photographer's public portfolio |
| `/album/[id]` | Album detail view |
| `/photo/[id]` | Single photo view (comments, likes, AI critique button) |
| `/dashboard` | Photographer dashboard (uploads, albums, analytics) |
| `/dashboard/upload` | Multi-photo upload with AI tagging preview |
| `/settings` | Profile & account settings |
| `/admin` | Admin moderation dashboard |
| `/login`, `/signup` | Auth pages |

---

## 7. UI/UX Requirements

- Clean, gallery-first design — large imagery, minimal chrome, masonry/grid layout.
- Dark mode by default with a light-mode toggle.
- Smooth image lazy-loading with blur-up placeholders.
- Mobile-first responsive design.
- Upload flow shows a live progress bar + AI tag suggestions the user can edit before publishing.

---

## 8. Non-Functional Requirements

- Image uploads limited to 25 MB, auto-converted to WebP for storage efficiency.
- All Gemini calls go through Edge Functions — API key never touches the client.
- Rate-limit AI endpoints per user (e.g., 50 AI calls/day on free tier).
- GDPR-style data export/delete for user accounts.
- Basic analytics events (upload, view, like, search) logged to a `events` table for the admin dashboard.

---

## 9. Suggested Build Order

1. Supabase project setup: schema, RLS policies, storage buckets, `pgvector` extension.
2. Auth + profile creation flow.
3. Photo upload + storage + thumbnail generation.
4. Album/portfolio pages (no AI yet — static functionality first).
5. Gemini Edge Functions: captioning, tagging, embeddings.
6. Semantic search bar wired to `semantic-search` function.
7. Social features: likes, comments, follows, realtime notifications.
8. Admin dashboard + analytics.
9. (Optional) Stripe integration for sales.
10. Polish: dark mode, animations, SEO metadata, performance pass.

---


gemini api - [REDACTED_GEMINI_API_KEY]
supabase api - 

1. Install packages
Run this command to install the required dependencies.
Code:
File: Code
```
npm install @supabase/supabase-js @supabase/ssr
```

2. Add files
Add env variables, create Supabase client helpers, and set up middleware to keep sessions refreshed.
Code:
File: .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xyfusatuhytbtfjkbpbt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HLtRJaCy8EFdZdeXFP-iVg_OVUM1qzA
```

File: page.tsx
```
1import { createClient } from '@/utils/supabase/server'
2import { cookies } from 'next/headers'
3
4export default async function Page() {
5  const cookieStore = await cookies()
6  const supabase = createClient(cookieStore)
7
8  const { data: todos } = await supabase.from('todos').select()
9
10  return (
11    <ul>
12      {todos?.map((todo) => (
13        <li key={todo.id}>{todo.name}</li>
14      ))}
15    </ul>
16  )
17}
```

File: utils/supabase/server.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { cookies } from "next/headers";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
6
7export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
8  return createServerClient(
9    supabaseUrl!,
10    supabaseKey!,
11    {
12      cookies: {
13        getAll() {
14          return cookieStore.getAll()
15        },
16        setAll(cookiesToSet) {
17          try {
18            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
19          } catch {
20            // The `setAll` method was called from a Server Component.
21            // This can be ignored if you have middleware refreshing
22            // user sessions.
23          }
24        },
25      },
26    },
27  );
28};
```

File: utils/supabase/client.ts
```
1import { createBrowserClient } from "@supabase/ssr";
2
3const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
4const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
5
6export const createClient = () =>
7  createBrowserClient(
8    supabaseUrl!,
9    supabaseKey!,
10  );
```

File: utils/supabase/middleware.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { type NextRequest, NextResponse } from "next/server";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
6
7export const createClient = (request: NextRequest) => {
8  // Create an unmodified response
9  let supabaseResponse = NextResponse.next({
10    request: {
11      headers: request.headers,
12    },
13  });
14
15  const supabase = createServerClient(
16    supabaseUrl!,
17    supabaseKey!,
18    {
19      cookies: {
20        getAll() {
21          return request.cookies.getAll()
22        },
23        setAll(cookiesToSet) {
24          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
25          supabaseResponse = NextResponse.next({
26            request,
27          })
28          cookiesToSet.forEach(({ name, value, options }) =>
29            supabaseResponse.cookies.set(name, value, options)
30          )
31        },
32      },
33    },
34  );
35
36  return supabaseResponse
37};
```

3. Install Agent Skills (optional)
Agent Skills give AI coding tools ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently.
Code:
File: Code
```
npx skills add supabase/agent-skills
```

**Instruction to the AI coding assistant:** Scaffold the Next.js + Supabase project structure first (folders, `supabase/migrations`, `.env.example`), then implement features in the build order above, one milestone at a time, confirming each milestone works before moving to the next.