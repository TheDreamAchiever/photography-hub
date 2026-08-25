"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, SlidersHorizontal, ImageOff, RefreshCw } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PhotoGrid } from "@/components/PhotoGrid";
import { DataService } from "@/lib/dataService";
import { Photo } from "@/types";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialSort = searchParams.get("sort") || "trending";

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiIntent, setAiIntent] = useState<{ intent?: string; mood?: string; expandedTags?: string[] } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("All");

  const COLOR_FILTERS = [
    { name: "All", hex: "transparent" },
    { name: "Warm Amber", hex: "#f59e0b" },
    { name: "Slate Blue", hex: "#3b82f6" },
    { name: "Forest Green", hex: "#10b981" },
    { name: "Neon Magenta", hex: "#ec4899" },
    { name: "Monochrome", hex: "#71717a" },
  ];

  const fetchFilteredPhotos = async (query: string, category: string, sort: string) => {
    setLoading(true);

    // If there's a natural language query, run semantic search analysis with Gemini
    if (query && query.trim().length > 3) {
      setAiSearching(true);
      try {
        const aiRes = await fetch("/api/ai/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (aiRes.ok) {
          const intentData = await aiRes.json();
          setAiIntent(intentData);
        }
      } catch (err) {
        console.warn("Semantic search failed:", err);
      } finally {
        setAiSearching(false);
      }
    } else {
      setAiIntent(null);
    }

    const data = await DataService.getPhotos({
      category: category === "All" ? undefined : category,
      searchQuery: query || undefined,
      sortBy: sort,
    });

    setPhotos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFilteredPhotos(initialQ, initialCategory, initialSort);
  }, [initialQ, initialCategory, initialSort]);

  const handleSearch = ({ query, category, sort }: { query: string; category: string; sort: string }) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "All") params.set("category", category);
    if (sort) params.set("sort", sort);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Header & Search */}
      <div className="space-y-4 max-w-4xl">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Public Gallery</span>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100 mt-0.5">
            Explore Curated Photography
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Search with visual natural language queries, filter by mood or camera model, and discover world-class portfolios.
          </p>
        </div>

        <SearchBar
          initialQuery={initialQ}
          initialCategory={initialCategory}
          initialSort={initialSort}
          onSearch={handleSearch}
          aiIntent={aiIntent}
          isAiSearching={aiSearching}
        />
      </div>

      {/* Results Header with Count & Color Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-800/80 pt-6">
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
          <span>SHOWING:</span>
          <span className="text-neutral-100 font-bold">{photos.length}</span>
          <span>PHOTOGRAPHS</span>
          {initialCategory !== "All" && (
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              {initialCategory}
            </span>
          )}
        </div>

        {/* Color Palette Filter */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <span className="text-[11px]">COLOR TONE:</span>
          <div className="flex items-center gap-1.5">
            {COLOR_FILTERS.map((col) => (
              <button
                key={col.name}
                onClick={() => setSelectedColor(col.name)}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  selectedColor === col.name ? "ring-2 ring-neutral-400 scale-110" : "opacity-70 hover:opacity-100"
                } ${col.name === "All" ? "border-neutral-600 bg-neutral-800 flex items-center justify-center text-[9px] text-neutral-400" : "border-neutral-700"}`}
                style={col.name !== "All" ? { backgroundColor: col.hex } : undefined}
                title={col.name}
              >
                {col.name === "All" && "✦"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <PhotoGrid
        photos={photos}
        loading={loading}
        emptyTitle="No photographs match this search"
        emptySubtitle="Try broader natural language terms, or clear the category filter."
      />

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-neutral-500 animate-pulse">Loading gallery...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
