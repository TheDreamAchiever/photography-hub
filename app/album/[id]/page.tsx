"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, FolderHeart, Share2, Sparkles, User } from "lucide-react";
import { DataService } from "@/lib/dataService";
import { PhotoGrid } from "@/components/PhotoGrid";
import { useToast } from "@/components/Toast";
import { Album, Photo } from "@/types";

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const albumId = resolvedParams.id;
  const { toast } = useToast();

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlbum() {
      setLoading(true);
      const allAlbums = await DataService.getAlbums();
      const match = allAlbums.find((a) => a.id === albumId);
      if (match) {
        setAlbum(match);
        const albumPhotos = await DataService.getPhotos({ album_id: albumId });
        setPhotos(albumPhotos);
      }
      setLoading(false);
    }
    loadAlbum();
  }, [albumId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast("Album link copied to clipboard", "success");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-xs text-neutral-500 animate-pulse">
        Loading album collection...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="max-w-md mx-auto my-24 text-center p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-200">Album Not Found</h2>
        <p className="text-xs text-neutral-400">This album may be private or removed.</p>
        <Link href="/albums" className="inline-block px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-xs font-medium">
          View All Albums
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <Link href="/albums" className="inline-flex items-center gap-1.5 hover:text-neutral-200 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Albums</span>
        </Link>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Album</span>
        </button>
      </div>

      {/* Album Hero Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase">
                {album.category || "Series"}
              </span>
              <span>•</span>
              <span className="capitalize">{album.visibility} Collection</span>
              <span>•</span>
              <span>{photos.length} Photographs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
              {album.title}
            </h1>

            {album.description && (
              <p className="text-sm text-neutral-300 leading-relaxed font-serif pt-1">
                {album.description}
              </p>
            )}
          </div>

          {album.profiles && (
            <Link
              href={`/@${album.profiles.username}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700 transition-colors group shrink-0"
            >
              <img
                src={album.profiles.avatar_url}
                alt={album.profiles.display_name}
                className="w-11 h-11 rounded-full object-cover border border-neutral-700"
              />
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">Curated by</span>
                <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors">
                  {album.profiles.display_name}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono block">@{album.profiles.username}</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Photos in Album */}
      <div className="space-y-6">
        <h2 className="text-sm uppercase font-mono tracking-wider text-neutral-400">
          Photographs in this Collection
        </h2>
        <PhotoGrid photos={photos} emptyTitle="No photos in this album yet" />
      </div>

    </div>
  );
}
