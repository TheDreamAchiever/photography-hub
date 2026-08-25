"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  Camera, 
  Globe, 
  Heart, 
  Eye, 
  Users, 
  FolderHeart, 
  Grid, 
  ShoppingBag, 
  Info,
  Check,
  Share2,
  AtSign,
  ExternalLink
} from "lucide-react";
import { DataService } from "@/lib/dataService";
import { PhotoGrid } from "@/components/PhotoGrid";
import { useToast } from "@/components/Toast";
import { Profile, Photo, Album } from "@/types";

export default function PhotographerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username).replace(/^@/, "");
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeTab, setActiveTab] = useState<"portfolio" | "albums" | "store" | "gear">("portfolio");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPhotographer() {
      setLoading(true);
      const user = await DataService.getProfileByUsername(username);
      if (user) {
        setProfile(user);
        const userPhotos = await DataService.getPhotos({ owner_id: user.id });
        setPhotos(userPhotos);
        const userAlbums = await DataService.getAlbums(user.id);
        setAlbums(userAlbums);
      }
      setLoading(false);
    }
    loadPhotographer();
  }, [username]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast(
      isFollowing
        ? `Unfollowed ${profile?.display_name}`
        : `Now following ${profile?.display_name}`,
      "info"
    );
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast("Portfolio link copied to clipboard", "success");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-xs text-neutral-500 animate-pulse">
        Loading photographer portfolio...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-24 text-center p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-200">Photographer Not Found</h2>
        <p className="text-xs text-neutral-400">@{username} does not exist or has changed their handle.</p>
        <Link href="/explore" className="inline-block px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-xs font-medium">
          Browse Featured Photographers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      
      {/* Profile Header Card */}
      <div className="rounded-3xl overflow-hidden bg-neutral-900/60 border border-neutral-800 shadow-2xl">
        
        {/* Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-neutral-950 overflow-hidden">
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt={profile.display_name}
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 sm:px-10 pb-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-neutral-900 shadow-2xl bg-neutral-800"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
                    {profile.display_name}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-800 border border-neutral-700 text-neutral-300">
                    {profile.role}
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-400">@{profile.username}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                title="Share portfolio"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-xl text-xs font-mono transition-all ${
                  isFollowing
                    ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                    : "bg-neutral-100 text-neutral-950 font-medium hover:bg-white active:scale-95 shadow-md"
                }`}
              >
                {isFollowing ? "Following" : "Follow Artist"}
              </button>
            </div>
          </div>

          {/* Bio & Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 space-y-3">
              {profile.bio && (
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono pt-1">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-neutral-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-neutral-200 transition-colors"
                  >
                    <AtSign className="w-3.5 h-3.5" />
                    <span>ig/{profile.instagram}</span>
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-neutral-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>x/{profile.twitter}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-start md:justify-end gap-6 sm:gap-8 font-mono text-xs text-neutral-500 border-t md:border-t-0 md:border-l border-neutral-800/80 pt-4 md:pt-0 md:pl-8">
              <div>
                <span className="text-lg font-bold text-neutral-200 block">{photos.length}</span>
                <span className="text-[11px]">Works</span>
              </div>
              <div>
                <span className="text-lg font-bold text-neutral-200 block">{profile.followers_count || 1240}</span>
                <span className="text-[11px]">Followers</span>
              </div>
              <div>
                <span className="text-lg font-bold text-neutral-200 block">{albums.length}</span>
                <span className="text-[11px]">Albums</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "portfolio"
              ? "bg-neutral-900 border border-neutral-700 text-neutral-100 font-medium"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Portfolio ({photos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("albums")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "albums"
              ? "bg-neutral-900 border border-neutral-700 text-neutral-100 font-medium"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
          }`}
        >
          <FolderHeart className="w-3.5 h-3.5" />
          <span>Albums ({albums.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("store")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "store"
              ? "bg-neutral-900 border border-neutral-700 text-neutral-100 font-medium"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Prints & Licensing</span>
        </button>

        <button
          onClick={() => setActiveTab("gear")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "gear"
              ? "bg-neutral-900 border border-neutral-700 text-neutral-100 font-medium"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Gear & Bio</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "portfolio" && (
        <PhotoGrid photos={photos} emptyTitle="No published works yet" />
      )}

      {activeTab === "albums" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="group p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 space-y-3 transition-all hover:shadow-2xl"
            >
              <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-950 relative">
                {album.cover_photo?.storage_path ? (
                  <img
                    src={album.cover_photo.storage_path}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <FolderHeart className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-[10px] font-mono text-neutral-300">
                  {album.photos_count || 6} Photos
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors">
                  {album.title}
                </h3>
                {album.description && (
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {album.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "store" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
            <span>All prints are hand-inspected and printed on museum archival cotton rag paper.</span>
            <span className="font-mono text-neutral-300">Global Shipping Available</span>
          </div>
          <PhotoGrid photos={photos} />
        </div>
      )}

      {activeTab === "gear" && (
        <div className="max-w-2xl space-y-6 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-200 uppercase font-mono tracking-wider">
              Camera Bodies & Lenses
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Gear used to produce this portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {profile.gear_list?.map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
                <Camera className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>{item}</span>
              </div>
            )) || (
              <p className="text-neutral-500 text-xs">No camera gear listed yet.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
