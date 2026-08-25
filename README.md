# 📷 Photography-Hub

> **A minimalist, professional web platform for fine art photographers to showcase portfolios, analyze images with Google Gemini Vision AI, extract EXIF metadata, and license prints.**

---

## 🌟 Overview & Highlights

- **Aesthetic**: Minimalist, dark-mode-first editorial design with neutral tones, glassmorphism cards, hairline borders, and responsive masonry layouts.
- **Multimodal AI (Google Gemini 2.5)**:
  - **Auto-Captioning & Descriptions**: Generates editorial captions, scene analysis, and color palettes.
  - **Categorized Auto-Tagging**: Tags subject, lighting, mood, aesthetic, and location type.
  - **Natural-Language Semantic Search**: Matches evocative descriptions (e.g. *"foggy alpine sunrise"* or *"rainy neon reflections"*) against visual attributes.
  - **AI Curator Critique & RAW Presets**: In-depth judging of composition, lighting, and color harmony with recommended Lightroom adjustments.
- **EXIF Extraction**: Client-side parsing of Camera body, Lens, Aperture ($f$-stop), Shutter Speed, ISO, and focal length using `exifr`.
- **Portfolios & Albums**: Custom photographer URLs (`/@username`), curated series, and drag-and-drop management.
- **Supabase Integration**: PostgreSQL schema with `pgvector` embeddings, Row Level Security (RLS) policies, and storage setup.
- **Monetization & Licensing**: Tiered licensing selector (Personal, Commercial, Museum Archival Print) with instant checkout flow.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The `.env.local` file contains the connected Supabase and Gemini credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyfusatuhytbtfjkbpbt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HLtRJaCy8EFdZdeXFP-iVg_OVUM1qzA
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_HLtRJaCy8EFdZdeXFP-iVg_OVUM1qzA
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database & Storage Setup

Run the SQL migration in your Supabase SQL Editor:
- **Core Schema & Vector Match RPC**: [`supabase/migrations/20240101_init.sql`](supabase/migrations/20240101_init.sql)
- **Storage Buckets & Policies**: [`supabase/storage_setup.sql`](supabase/storage_setup.sql)

---

## 🧭 Routes & Pages Map

| Route | Description |
|---|---|
| `/` | Landing page with Hero, AI Natural Language search, and Photographer spotlights |
| `/explore` | Public gallery with masonry grid, color tone filters, and Gemini semantic query analyzer |
| `/photo/[id]` | Immersive high-res viewer with EXIF specs card, Gemini insights, AI Critique modal, and licensing |
| `/@username` | Photographer custom public portfolio, gear registry, bio, and albums |
| `/albums` | Curated thematic collections directory |
| `/album/[id]` | Single album view with series photographs |
| `/dashboard` | Photographer command center with analytics (Views, Likes, Earnings, Storage) |
| `/dashboard/upload` | Upload studio with client-side EXIF extractor and live Gemini auto-tagger |
| `/settings` | Profile editor, camera gear registry, and GDPR data export |
| `/admin` | Superadmin moderation console, flagged content queue, and health metrics |
| `/login` | Auth portal with 1-click persona switchers for instant role testing |

---

## 🤖 Server-Side AI Endpoints

- `POST /api/ai/caption-tags`: Multimodal image vision analysis returning title, caption, tags, and palette.
- `POST /api/ai/critique`: Photographic critique analyzing composition, lighting, color grading, and technical sharpness.
- `POST /api/ai/semantic-search`: Natural-language search intent understanding and semantic keyword expansion.
