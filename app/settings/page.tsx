"use client";

import React, { useState, useEffect } from "react";
import { Camera, Save, User, ShieldCheck, HardDrive, Key, Plus, X, Download } from "lucide-react";
import { DataService } from "@/lib/dataService";
import { useToast } from "@/components/Toast";
import { Profile } from "@/types";

export default function SettingsPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>(DataService.getActiveProfile());
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [gearList, setGearList] = useState<string[]>([]);
  const [newGearItem, setNewGearItem] = useState("");

  useEffect(() => {
    const active = DataService.getActiveProfile();
    setProfile(active);
    setDisplayName(active.display_name);
    setBio(active.bio || "");
    setWebsite(active.website || "");
    setInstagram(active.instagram || "");
    setTwitter(active.twitter || "");
    setGearList(active.gear_list || []);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Profile = {
      ...profile,
      display_name: displayName,
      bio,
      website,
      instagram,
      twitter,
      gear_list: gearList,
    };
    DataService.setActiveProfile(updated);
    setProfile(updated);
    toast("Settings updated successfully", "success");
  };

  const addGear = () => {
    if (newGearItem.trim() && !gearList.includes(newGearItem.trim())) {
      setGearList([...gearList, newGearItem.trim()]);
      setNewGearItem("");
    }
  };

  const removeGear = (item: string) => {
    setGearList(gearList.filter((g) => g !== item));
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `photography_hub_backup_${profile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast("GDPR Data export downloaded", "info");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header */}
      <div className="border-b border-neutral-800/80 pb-5">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Account Preferences</span>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100 mt-0.5">
          Profile & Gear Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Configure your public photographer profile, camera bodies, lenses, and security settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase font-mono tracking-wider">
            Public Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Username handle</label>
              <input
                type="text"
                value={profile.username}
                disabled
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800 text-neutral-500 text-xs font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-400">Photographer Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Instagram Handle</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="username"
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Twitter / X Handle</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="username"
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>
        </div>

        {/* Camera Gear Registry */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 uppercase font-mono tracking-wider">
              Camera Gear Registry
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Camera bodies, prime lenses, and tripods visible on your portfolio.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {gearList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono"
              >
                <Camera className="w-3 h-3 text-neutral-500" />
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeGear(item)}
                  className="text-neutral-500 hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              value={newGearItem}
              onChange={(e) => setNewGearItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGear();
                }
              }}
              placeholder="e.g. Leica Summilux 50mm f/1.4"
              className="flex-1 py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs font-mono focus:outline-none focus:border-neutral-600"
            />
            <button
              type="button"
              onClick={addGear}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* AI & Backend Integration Status */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase font-mono tracking-wider">
            Connected Infrastructure Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-300">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Google Gemini 2.5 API</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                Active (Server-Side)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Supabase PostgreSQL + pgvector</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                Configured
              </span>
            </div>
          </div>
        </div>

        {/* Data Rights & Export */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-neutral-200 uppercase font-mono">
              GDPR Data Portability
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Export your portfolio data, EXIF history, and captions as clean JSON.
            </p>
          </div>

          <button
            type="button"
            onClick={exportData}
            className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-mono flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 text-xs font-medium hover:bg-white active:scale-95 transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>

    </div>
  );
}
