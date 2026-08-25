"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Sparkles, Eye, Download } from "lucide-react";
import { Photo } from "@/types";
import { DataService } from "@/lib/dataService";
import { useToast } from "./Toast";
import { ExifBadge } from "./ExifBadge";

interface PhotoCardProps {
  photo: Photo;
  onPhotoClick?: (photo: Photo) => void;
  priority?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onPhotoClick }) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(photo.is_liked || false);
  const [likesCount, setLikesCount] = useState(photo.likes_count || 0);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const res = await DataService.toggleLike(photo.id);
    setIsLiked(res.isLiked);
    setLikesCount(res.count);
    if (res.isLiked) {
      toast(`Liked "${photo.title}"`, "success");
    }
  };

  return (
    <div className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/80 transition-all duration-300 hover:border-neutral-700 hover:shadow-2xl">
      <Link href={`/photo/${photo.id}`} className="block relative aspect-[4/3] sm:aspect-auto w-full overflow-hidden">
        {/* Loading shimmer placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
        )}

        <img
          src={photo.storage_path}
          alt={photo.title || "Photograph"}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Ambient Dark Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4" />

        {/* Top Header Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {/* Photographer Chip */}
          {photo.profiles && (
            <Link
              href={`/@${photo.profiles.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 text-neutral-200 hover:text-white transition-colors"
            >
              <img
                src={photo.profiles.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
                alt={photo.profiles.display_name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-[11px] font-medium tracking-tight truncate max-w-[100px]">
                {photo.profiles.display_name}
              </span>
            </Link>
          )}

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
              isLiked
                ? "bg-rose-500/20 border-rose-500/60 text-rose-400"
                : "bg-neutral-950/80 border-neutral-800/80 text-neutral-300 hover:text-white hover:scale-110"
            }`}
            title="Like photo"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 space-y-2">
          <div>
            <h3 className="text-sm font-medium text-neutral-100 line-clamp-1">
              {photo.title}
            </h3>
            {photo.location && (
              <p className="text-[11px] text-neutral-400 font-mono line-clamp-1">{photo.location}</p>
            )}
          </div>

          {/* EXIF Specs preview */}
          <ExifBadge photo={photo} compact />

          {/* AI Tags Preview */}
          {photo.ai_tags && photo.ai_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {photo.ai_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-neutral-900/90 border border-neutral-800 text-[10px] text-neutral-300 font-mono"
                >
                  #{tag}
                </span>
              ))}
              {photo.ai_tags.length > 3 && (
                <span className="text-[10px] text-neutral-400 font-mono self-center">
                  +{photo.ai_tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
