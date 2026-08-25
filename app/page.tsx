"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  Compass, 
  Zap, 
  ShieldCheck, 
  Eye, 
  Heart,
  Layers
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PhotoGrid } from "@/components/PhotoGrid";
import { DataService } from "@/lib/dataService";
import { DEMO_PROFILES, DEMO_PHOTOS } from "@/lib/mockData";
import { Photo } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await DataService.getPhotos({ sortBy: "trending" });
      setPhotos(data.slice(0, 6));
      setLoading(false);
    }
    load();
  }, []);

  const handleHeroSearch = ({ query, category, sort }: { query: string; category: string; sort: string }) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "All") params.set("category", category);
    if (sort) params.set("sort", sort);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-20 pb-16 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Google Gemini Vision • Fine Art Photography Network</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-[1.1]">
            Where pure imagery meets visual intelligence.
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            The minimalist sanctuary for photographers to curate portfolios, extract EXIF metadata, receive AI critiques, and license archival works.
          </p>

          {/* Integrated AI Search Box */}
          <div className="pt-4 max-w-2xl mx-auto">
            <SearchBar onSearch={handleHeroSearch} />
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 flex items-center justify-center gap-8 sm:gap-12 text-xs font-mono text-neutral-500">
            <div>
              <span className="text-base font-bold text-neutral-200 block">4K / 8K</span>
              <span>Master Quality</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div>
              <span className="text-base font-bold text-neutral-200 block">EXIF-Native</span>
              <span>Camera Metadata</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div>
              <span className="text-base font-bold text-neutral-200 block">Gemini 2.5</span>
              <span>Vision Critique</span>
            </div>
          </div>
        </div>
      </section>

      {/* CURATED SPOTLIGHT GALLERIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Editorial Selection</span>
            <h2 className="text-xl font-semibold text-neutral-100 mt-0.5">Featured Photographs</h2>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-100 font-mono transition-colors group"
          >
            <span>Explore All Works</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <PhotoGrid photos={photos} loading={loading} />
      </section>

      {/* FEATURED PHOTOGRAPHERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Curators & Artists</span>
            <h2 className="text-xl font-semibold text-neutral-100 mt-0.5">Photographer Spotlights</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_PROFILES.filter(p => p.role === "photographer").map((artist) => (
            <Link
              key={artist.id}
              href={`/@${artist.username}`}
              className="group p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-4 hover:shadow-2xl"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={artist.avatar_url}
                  alt={artist.display_name}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-700 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors">
                    {artist.display_name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">@{artist.username}</p>
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                {artist.bio}
              </p>

              {/* Gear tags */}
              {artist.gear_list && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {artist.gear_list.slice(0, 2).map((gear) => (
                    <span
                      key={gear}
                      className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-400"
                    >
                      {gear}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60 text-[11px] font-mono text-neutral-500">
                <span>{artist.followers_count} Followers</span>
                <span className="text-neutral-400 group-hover:text-neutral-200 flex items-center gap-1">
                  View Portfolio <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI CAPABILITIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 space-y-8">
          
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">Next-Gen Intelligence</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100">
              Powered by Google Gemini 2.5 Multimodal Vision
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Every photograph is analyzed in milliseconds to enrich your metadata, enhance accessibility, and offer technical critiques.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-200">Auto-Tagging & Editorial Captions</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Gemini identifies visual subjects, lighting conditions, mood, and color swatches without requiring manual typing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-200">Semantic Natural Language Search</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Search with evocative queries like &ldquo;rainy neon alley&rdquo; or &ldquo;misty dawn pine peaks&rdquo; mapped by pgvector.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-200">AI Curator Critique & RAW Presets</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Get judge-level feedback on composition, lighting balance, and Lightroom adjustment parameters.
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800/80">
            <p className="text-xs text-neutral-400 font-mono">
              Ready to showcase your photography?
            </p>
            <Link
              href="/dashboard/upload"
              className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 font-medium text-xs hover:bg-white transition-all shadow-md flex items-center gap-2"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Your First Photo</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
