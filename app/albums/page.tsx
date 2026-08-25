"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderHeart, Plus, ArrowRight, Layers } from "lucide-react";
import { DataService } from "@/lib/dataService";
import { Album } from "@/types";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await DataService.getAlbums();
      setAlbums(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Curated Collections</span>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100 mt-0.5">
            Photographic Albums
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Thematic photo series exploring wilderness expanses, urban neon nights, and studio portraiture.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-950 hover:bg-white text-xs font-medium transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Album</span>
        </Link>
      </div>

      {/* Albums Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-neutral-900 animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="group rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700 overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full bg-neutral-950 overflow-hidden">
                {album.cover_photo?.storage_path ? (
                  <img
                    src={album.cover_photo.storage_path}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <FolderHeart className="w-10 h-10" />
                  </div>
                )}
                
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-[11px] font-mono text-neutral-200">
                  {album.photos_count || 6} Photos
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 mb-1">
                    <span>{album.category || "General"}</span>
                    <span>•</span>
                    <span className="capitalize">{album.visibility}</span>
                  </div>

                  <h3 className="text-base font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors">
                    {album.title}
                  </h3>

                  {album.description && (
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  )}
                </div>

                {album.profiles && (
                  <div className="pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={album.profiles.avatar_url}
                        alt={album.profiles.display_name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-neutral-300 font-medium">
                        {album.profiles.display_name}
                      </span>
                    </div>

                    <span className="text-neutral-500 group-hover:text-neutral-200 transition-colors">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
