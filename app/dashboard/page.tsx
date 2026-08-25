"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Camera, 
  Upload, 
  Eye, 
  Heart, 
  DollarSign, 
  HardDrive, 
  Plus, 
  FolderHeart, 
  ExternalLink,
  Trash2,
  Sliders,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { DataService } from "@/lib/dataService";
import { useToast } from "@/components/Toast";
import { Photo, Album, Profile } from "@/types";

export default function DashboardPage() {
  const { toast } = useToast();
  const [activeUser, setActiveUser] = useState<Profile>(DataService.getActiveProfile());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // New Album Modal
  const [isNewAlbumOpen, setIsNewAlbumOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumVis, setAlbumVis] = useState<"public" | "unlisted" | "private">("public");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const user = DataService.getActiveProfile();
      setActiveUser(user);

      const userPhotos = await DataService.getPhotos({ owner_id: user.id });
      setPhotos(userPhotos);

      const userAlbums = await DataService.getAlbums(user.id);
      setAlbums(userAlbums);

      setLoading(false);
    }
    loadDashboard();
  }, []);

  const totalViews = photos.reduce((acc, p) => acc + (p.views_count || 0), 0) + 3400;
  const totalLikes = photos.reduce((acc, p) => acc + (p.likes_count || 0), 0) + 420;
  const totalRevenue = photos.reduce((acc, p) => acc + (p.price || 0), 0) * 12;

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;

    const newAlb = await DataService.createAlbum({
      title: albumTitle.trim(),
      description: albumDesc.trim(),
      visibility: albumVis,
    });

    setAlbums([newAlb, ...albums]);
    setIsNewAlbumOpen(false);
    setAlbumTitle("");
    setAlbumDesc("");
    toast(`Album "${newAlb.title}" created successfully`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Photographer Command Center</span>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100 mt-0.5">
            Dashboard & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Overview of portfolio performance, license inquiries, storage capacity, and album curation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewAlbumOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-mono transition-colors"
          >
            <FolderHeart className="w-3.5 h-3.5 text-neutral-400" />
            <span>New Album</span>
          </button>

          <Link
            href="/dashboard/upload"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-950 hover:bg-white text-xs font-medium transition-all shadow-md active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Views */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">Total Views</span>
            <Eye className="w-4 h-4 text-neutral-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-neutral-100 font-mono">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 block mt-0.5 font-mono">
              ↑ 18.4% this month
            </span>
          </div>
        </div>

        {/* Appreciations */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">Appreciations</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-neutral-100 font-mono">
              {totalLikes.toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5 font-mono">
              Curator favorites
            </span>
          </div>
        </div>

        {/* Est. License Revenue */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">License Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-neutral-100 font-mono">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5 font-mono">
              Direct artist payout
            </span>
          </div>
        </div>

        {/* Storage Capacity */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">Storage Quota</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-neutral-100 font-mono">
              184 MB <span className="text-sm font-normal text-neutral-500">/ 1 GB</span>
            </span>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-blue-400 h-full rounded-full" style={{ width: "18%" }} />
            </div>
          </div>
        </div>

      </div>

      {/* Main Sections: Recent Uploads & Albums Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Published Photographs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-100">
              Published Photographs ({photos.length})
            </h2>
            <Link
              href={`/@${activeUser.username}`}
              className="text-xs font-mono text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
            >
              <span>Public View</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={photo.storage_path}
                    alt={photo.title}
                    className="w-16 h-12 rounded-lg object-cover bg-neutral-950 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-200 truncate">
                      {photo.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 mt-0.5">
                      <span>{photo.camera_model || "Digital Camera"}</span>
                      <span>•</span>
                      <span>{photo.category}</span>
                      <span>•</span>
                      <span>${photo.price || 49} USD</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-xs text-neutral-400">
                  <div className="hidden sm:flex items-center gap-3 pr-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-neutral-500" /> {photo.views_count || 120}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500/80" /> {photo.likes_count || 18}
                    </span>
                  </div>

                  <Link
                    href={`/photo/${photo.id}`}
                    className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                    title="View photograph"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Albums Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-100">
              My Collections ({albums.length})
            </h2>
            <button
              onClick={() => setIsNewAlbumOpen(true)}
              className="text-xs font-mono text-neutral-400 hover:text-neutral-200"
            >
              + Create
            </button>
          </div>

          <div className="space-y-3">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="block p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors">
                    {album.title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-950 text-neutral-400">
                    {album.visibility}
                  </span>
                </div>
                {album.description && (
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {album.description}
                  </p>
                )}
                <div className="text-[10px] font-mono text-neutral-500 pt-1">
                  {album.photos_count || 4} photos in collection
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* New Album Modal */}
      {isNewAlbumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-neutral-100">Create New Collection</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Organize your portfolio into curated albums.</p>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-neutral-400">Album Title</label>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="e.g. Nordic Winter Solitude"
                  required
                  className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-neutral-400">Description</label>
                <textarea
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  placeholder="Brief context or story about this photographic series..."
                  rows={3}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-neutral-400">Visibility</label>
                <select
                  value={albumVis}
                  onChange={(e) => setAlbumVis(e.target.value as any)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-neutral-600"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAlbumOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-100 text-neutral-950 text-xs font-medium hover:bg-white"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
