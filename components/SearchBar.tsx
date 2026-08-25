"use client";

import React, { useState } from "react";
import { Search, Sparkles, SlidersHorizontal, X, ArrowRight } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: string;
  onSearch: (params: { query: string; category: string; sort: string }) => void;
  aiIntent?: { intent?: string; mood?: string; expandedTags?: string[] } | null;
  isAiSearching?: boolean;
}

const CATEGORIES = [
  "All",
  "Landscape",
  "Street",
  "Portrait",
  "Architecture",
  "Nature",
  "Film/Analog",
];

const PRESET_QUERIES = [
  "Moody Nordic mountain fog at dawn",
  "Cyberpunk neon street reflections in rain",
  "Chiaroscuro fine art studio portrait",
  "Minimalist macro botanical spiral",
];

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  initialCategory = "All",
  initialSort = "trending",
  onSearch,
  aiIntent,
  isAiSearching = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, category: selectedCategory, sort: selectedSort });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    onSearch({ query, category: cat, sort: selectedSort });
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSearch({ query, category: selectedCategory, sort });
  };

  const handlePresetClick = (preset: string) => {
    setQuery(preset);
    onSearch({ query: preset, category: selectedCategory, sort: selectedSort });
  };

  const clearQuery = () => {
    setQuery("");
    onSearch({ query: "", category: selectedCategory, sort: selectedSort });
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative w-full group">
        <div className="relative flex items-center w-full rounded-xl bg-neutral-900/90 border border-neutral-800 focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-neutral-600 transition-all shadow-xl">
          <div className="pl-4 text-neutral-400">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search naturally (e.g. 'golden hour mountain fog' or '35mm street neon')..."
            className="w-full py-3.5 pl-3 pr-28 bg-transparent text-neutral-100 placeholder:text-neutral-500 text-sm focus:outline-none"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="p-1 rounded text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isAiSearching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-950 hover:bg-neutral-200 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            >
              {isAiSearching ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                  <span>Analyzing...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="hidden sm:inline">AI Search</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* AI Intent Breakdown & expanded tags */}
      {aiIntent?.intent && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800/60 text-xs animate-fade-in font-mono">
          <div className="flex items-center gap-1 text-amber-400 shrink-0">
            <Sparkles className="w-3 h-3" />
            <span className="text-[11px] uppercase tracking-wide">Gemini Scene Understanding:</span>
          </div>
          <span className="text-neutral-300 font-sans">{aiIntent.intent}</span>
          {aiIntent.mood && (
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300">
              Mood: {aiIntent.mood}
            </span>
          )}
          {aiIntent.expandedTags && aiIntent.expandedTags.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-neutral-500 text-[10px]">Semantic matches:</span>
              {aiIntent.expandedTags.slice(0, 4).map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 rounded bg-neutral-800/80 text-[10px] text-neutral-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories & Sorting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-neutral-100 text-neutral-950 shadow-sm"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 self-end sm:self-auto font-mono">
          <span className="text-neutral-500 text-[11px]">SORT:</span>
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-neutral-700"
          >
            <option value="trending">Trending</option>
            <option value="recent">Latest Uploads</option>
            <option value="likes">Most Appreciated</option>
          </select>
        </div>
      </div>

      {/* Preset Query Inspirations */}
      {!query && (
        <div className="flex items-center gap-2 text-[11px] text-neutral-500 overflow-x-auto pb-1">
          <span className="shrink-0 text-neutral-600 font-mono">TRY:</span>
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className="shrink-0 px-2 py-0.5 rounded bg-neutral-900/60 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800/40 transition-colors"
            >
              &ldquo;{preset}&rdquo;
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
