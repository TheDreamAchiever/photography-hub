"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Trash2, 
  Users, 
  HardDrive, 
  Eye, 
  Sparkles,
  Activity,
  Layers
} from "lucide-react";
import { DataService } from "@/lib/dataService";
import { DEMO_PROFILES, DEMO_PHOTOS } from "@/lib/mockData";
import { useToast } from "@/components/Toast";
import { Profile, Photo } from "@/types";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [activeUser, setActiveUser] = useState<Profile>(DataService.getActiveProfile());
  const [photos, setPhotos] = useState<Photo[]>(DEMO_PHOTOS);
  const [users, setUsers] = useState<Profile[]>(DEMO_PROFILES);
  const [flaggedPhotos, setFlaggedPhotos] = useState<Photo[]>([
    {
      id: "flagged-1",
      owner_id: "user-2",
      title: "Potential Copyright Inconsistency",
      storage_path: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
      caption: "Flagged by community for duplicate watermark review.",
      is_public: false,
      category: "Street",
      created_at: new Date().toISOString(),
      profiles: DEMO_PROFILES[1],
    }
  ]);

  const handleApprove = (id: string) => {
    setFlaggedPhotos(flaggedPhotos.filter((p) => p.id !== id));
    toast("Item approved and cleared from moderation queue", "success");
  };

  const handleRemove = (id: string) => {
    setFlaggedPhotos(flaggedPhotos.filter((p) => p.id !== id));
    toast("Item removed from platform", "error");
  };

  const handleRoleChange = (userId: string, newRole: "viewer" | "photographer" | "admin") => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    toast(`User role updated to ${newRole}`, "info");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span className="uppercase tracking-wider">Superadmin Console</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100 mt-1">
            Platform Moderation & Health
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Status: Optimal</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <span className="text-xs font-mono uppercase text-neutral-500">Registered Creators</span>
          <p className="text-2xl font-bold text-neutral-100 font-mono">{users.length * 142}</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <span className="text-xs font-mono uppercase text-neutral-500">Total Curated Works</span>
          <p className="text-2xl font-bold text-neutral-100 font-mono">1,842</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <span className="text-xs font-mono uppercase text-neutral-500">Gemini AI Invocations</span>
          <p className="text-2xl font-bold text-amber-400 font-mono">4,920</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <span className="text-xs font-mono uppercase text-neutral-500">Storage Allocated</span>
          <p className="text-2xl font-bold text-neutral-100 font-mono">14.8 GB</p>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Flagged Content Queue ({flaggedPhotos.length})</span>
          </div>
        </div>

        {flaggedPhotos.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-neutral-500">
            All moderation queues clear. No pending flags.
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={photo.storage_path}
                    alt={photo.title}
                    className="w-16 h-12 rounded-lg object-cover bg-neutral-900"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">{photo.title}</h4>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{photo.caption}</p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      Uploaded by @{photo.profiles?.username || "unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <button
                    onClick={() => handleApprove(photo.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleRemove(photo.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-300">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Platform User Directory & Roles</span>
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                />
                <div>
                  <span className="font-semibold text-neutral-200 block font-sans">{user.display_name}</span>
                  <span className="text-[11px] text-neutral-500">@{user.username}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                >
                  <option value="photographer">Photographer</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Superadmin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
