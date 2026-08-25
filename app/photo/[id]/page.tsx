"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  Heart, 
  Share2, 
  Download, 
  Sparkles, 
  MessageSquare, 
  UserCheck, 
  UserPlus, 
  Maximize2, 
  ChevronLeft,
  Calendar,
  Layers,
  ShoppingBag,
  Award
} from "lucide-react";
import { DataService } from "@/lib/dataService";
import { ExifBadge } from "@/components/ExifBadge";
import { AICritiqueModal } from "@/components/AICritiqueModal";
import { PurchaseModal } from "@/components/PurchaseModal";
import { PhotoGrid } from "@/components/PhotoGrid";
import { useToast } from "@/components/Toast";
import { Photo, Comment, AICritique } from "@/types";

export default function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const photoId = resolvedParams.id;
  const { toast } = useToast();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [relatedPhotos, setRelatedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCritiqueOpen, setIsCritiqueOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await DataService.getPhotoById(photoId);
      if (data) {
        setPhoto(data);
        setIsLiked(data.is_liked || false);
        setLikesCount(data.likes_count || 0);

        const comms = await DataService.getComments(photoId);
        setComments(comms);

        const related = await DataService.getPhotos({ category: data.category });
        setRelatedPhotos(related.filter((p) => p.id !== photoId).slice(0, 3));
      }
      setLoading(false);
    }
    loadData();
  }, [photoId]);

  const handleLike = async () => {
    if (!photo) return;
    const res = await DataService.toggleLike(photo.id);
    setIsLiked(res.isLiked);
    setLikesCount(res.count);
    if (res.isLiked) {
      toast("Added to your liked photographs", "success");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast("Photo link copied to clipboard!", "success");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !photo) return;
    setIsSubmittingComment(true);
    const added = await DataService.addComment(photo.id, newComment.trim());
    setComments((prev) => [...prev, added]);
    setNewComment("");
    setIsSubmittingComment(false);
    toast("Comment posted", "success");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3 font-mono text-xs text-neutral-500 animate-pulse">
        <div className="w-10 h-10 rounded-full border-2 border-neutral-700 border-t-neutral-300 animate-spin mx-auto" />
        <p>Loading master photograph & metadata...</p>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="max-w-md mx-auto my-24 text-center p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-200">Photograph Not Found</h2>
        <p className="text-xs text-neutral-400">This photo might have been removed or is set to private.</p>
        <Link href="/explore" className="inline-block px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-xs font-medium">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-4 text-xs font-mono text-neutral-400">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 hover:text-neutral-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition-colors"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-950 hover:bg-white font-medium shadow-sm transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>License / Buy Print</span>
          </button>
        </div>
      </div>

      {/* Main Image Showcase */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 shadow-2xl flex items-center justify-center group">
        <img
          src={photo.storage_path}
          alt={photo.title}
          className="w-full max-h-[80vh] object-contain mx-auto"
        />

        {/* Floating Zoom / Lightbox Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-neutral-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Fullscreen view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Details & Metadata Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Cols: Title, Caption, AI Insights, Comments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Title & Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              {photo.category && (
                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                  {photo.category}
                </span>
              )}
              {photo.location && <span>• {photo.location}</span>}
              {photo.created_at && (
                <span>• {new Date(photo.created_at).toLocaleDateString()}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
              {photo.title}
            </h1>

            {photo.caption && (
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-serif italic">
                &ldquo;{photo.caption}&rdquo;
              </p>
            )}
          </div>

          {/* Social Action Bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 font-mono text-xs">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                isLiked
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{likesCount} Likes</span>
            </button>

            <button
              onClick={() => setIsCritiqueOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {photo.ai_critique ? `AI Score: ${photo.ai_critique.overallScore}/100` : "AI Curator Critique"}
              </span>
            </button>
          </div>

          {/* Gemini AI Scene Analysis Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-300">
                  Gemini Vision Analysis
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Multimodal AI</span>
            </div>

            {photo.ai_description && (
              <p className="text-xs text-neutral-300 leading-relaxed">
                {photo.ai_description}
              </p>
            )}

            {/* AI Tags */}
            {photo.ai_tags && photo.ai_tags.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-neutral-500">SEMANTIC TAGS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {photo.ai_tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/explore?q=${encodeURIComponent(tag)}`}
                      className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Dominant Color Palette */}
            {photo.color_palette && photo.color_palette.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono text-neutral-500">DOMINANT TONAL PALETTE:</span>
                <div className="flex items-center gap-2">
                  {photo.color_palette.map((hex, i) => (
                    <div
                      key={i}
                      className="group/col relative w-7 h-7 rounded-md border border-neutral-700 cursor-pointer transition-transform hover:scale-110"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-mono text-neutral-200 opacity-0 group-hover/col:opacity-100 transition-opacity">
                        {hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4 border-t border-neutral-800/80">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-200">
                Community Discussion ({comments.length})
              </h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on composition, lighting, or gear..."
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-neutral-600"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 text-xs font-medium hover:bg-white disabled:opacity-40 transition-all"
              >
                Post
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {comments.map((comm) => (
                <div key={comm.id} className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={comm.profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"}
                        alt={comm.profile?.display_name || "User"}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-neutral-200">
                        {comm.profile?.display_name || "Photographer"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {new Date(comm.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-7">
                    {comm.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Photographer Profile & EXIF Specs */}
        <div className="space-y-6">
          
          {/* Photographer Profile Card */}
          {photo.profiles && (
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/@${photo.profiles.username}`}
                  className="flex items-center gap-3 group"
                >
                  <img
                    src={photo.profiles.avatar_url}
                    alt={photo.profiles.display_name}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-700 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors">
                      {photo.profiles.display_name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-mono">@{photo.profiles.username}</p>
                  </div>
                </Link>

                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isFollowing
                      ? "bg-neutral-800 text-neutral-300 border border-neutral-700"
                      : "bg-neutral-100 text-neutral-950 font-medium hover:bg-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>

              {photo.profiles.bio && (
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {photo.profiles.bio}
                </p>
              )}

              <Link
                href={`/@${photo.profiles.username}`}
                className="block text-center py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
              >
                View Full Portfolio ({photo.profiles.photos_count || 12} Works)
              </Link>
            </div>
          )}

          {/* EXIF Technical Card */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Technical Specifications</span>
            <ExifBadge photo={photo} />
          </div>

          {/* Licensing Purchase CTA Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-200">License this Photograph</span>
              <span className="font-mono text-sm font-bold text-neutral-100">${photo.price || 49} USD</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Acquire commercial reproduction rights or order museum-grade archival fine art prints.
            </p>
            <button
              onClick={() => setIsPurchaseOpen(true)}
              className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-950 text-xs font-medium hover:bg-white transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Select License Tier</span>
            </button>
          </div>

        </div>

      </div>

      {/* Related Works Stream */}
      {relatedPhotos.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-neutral-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-100">More in {photo.category}</h3>
            <Link href={`/explore?category=${photo.category}`} className="text-xs font-mono text-neutral-400 hover:text-neutral-200">
              View All
            </Link>
          </div>
          <PhotoGrid photos={relatedPhotos} />
        </div>
      )}

      {/* Modals */}
      <AICritiqueModal
        photo={photo}
        isOpen={isCritiqueOpen}
        onClose={() => setIsCritiqueOpen(false)}
        onUpdatePhotoCritique={(c) => setPhoto({ ...photo, ai_critique: c })}
      />

      <PurchaseModal
        photo={photo}
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <img
            src={photo.storage_path}
            alt={photo.title}
            className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

    </div>
  );
}
