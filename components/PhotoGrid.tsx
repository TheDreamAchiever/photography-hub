"use client";

import React from "react";
import { Photo } from "@/types";
import { PhotoCard } from "./PhotoCard";
import { Camera, ImageOff } from "lucide-react";
import Link from "next/link";

interface PhotoGridProps {
  photos: Photo[];
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  loading = false,
  emptyTitle = "No photographs found",
  emptySubtitle = "Try adjusting your search query or selecting a different category.",
}) => {
  if (loading) {
    return (
      <div className="masonry-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="masonry-item rounded-xl bg-neutral-900/60 border border-neutral-800 animate-pulse aspect-[4/3]"
          />
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-400 mb-4">
          <ImageOff className="w-6 h-6" />
        </div>
        <h3 className="text-base font-medium text-neutral-200">{emptyTitle}</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">{emptySubtitle}</p>
        <Link
          href="/dashboard/upload"
          className="mt-6 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-xs font-medium hover:bg-neutral-200 transition-colors"
        >
          Upload Photograph
        </Link>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {photos.map((photo) => (
        <div key={photo.id} className="masonry-item">
          <PhotoCard photo={photo} />
        </div>
      ))}
    </div>
  );
};
