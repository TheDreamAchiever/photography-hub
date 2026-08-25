"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Camera, 
  Upload, 
  Search, 
  Sparkles, 
  User, 
  Settings, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Compass,
  FolderHeart
} from "lucide-react";
import { DataService } from "@/lib/dataService";
import { DEMO_PROFILES } from "@/lib/mockData";
import { Profile } from "@/types";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<Profile>(DEMO_PROFILES[0]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const user = DataService.getActiveProfile();
    setActiveUser(user);

    // Theme initialization
    const isDark = !document.documentElement.classList.contains("light");
    setIsDarkMode(isDark);
  }, [pathname]);

  const switchUser = (profile: Profile) => {
    DataService.setActiveProfile(profile);
    setActiveUser(profile);
    setIsUserMenuOpen(false);
    router.refresh();
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.add("light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.remove("light");
      setIsDarkMode(true);
    }
  };

  const navLinks = [
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Albums", href: "/albums", icon: FolderHeart },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/60 flex items-center justify-center text-neutral-100 group-hover:border-neutral-500 transition-colors">
              <Camera className="w-4 h-4 text-neutral-200" />
            </div>
            <span className="font-medium tracking-tight text-sm uppercase text-neutral-100 font-mono flex items-center gap-1.5">
              Photography<span className="text-neutral-500">/</span>Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs tracking-wide font-medium transition-all ${
                    isActive
                      ? "text-neutral-100 bg-neutral-900 border border-neutral-800"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick AI Search Link */}
          <Link
            href="/explore"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">AI Search</span>
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 font-mono">
              <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-400" /> Gemini
            </div>
          </Link>

          {/* Upload CTA */}
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-neutral-100 text-neutral-950 hover:bg-neutral-200 text-xs font-medium tracking-tight shadow-sm transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Active User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-neutral-700/60 transition-all"
            >
              <img
                src={activeUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                alt={activeUser.display_name}
                className="w-7 h-7 rounded-full object-cover border border-neutral-700"
              />
            </button>

            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 animate-fade-in text-xs font-sans"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                {/* User Info */}
                <div className="px-3 py-2.5 border-b border-neutral-800/80 mb-1">
                  <p className="font-medium text-neutral-200 truncate">{activeUser.display_name}</p>
                  <p className="text-[11px] text-neutral-500 font-mono">@{activeUser.username} • <span className="capitalize text-neutral-400">{activeUser.role}</span></p>
                </div>

                {/* Switch Role / Demo User */}
                <div className="px-2 py-1.5">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 px-1 mb-1">Switch Perspective</p>
                  <div className="space-y-0.5">
                    {DEMO_PROFILES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => switchUser(p)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors ${
                          activeUser.id === p.id
                            ? "bg-neutral-800 text-neutral-100 font-medium"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                        }`}
                      >
                        <span className="truncate">{p.display_name}</span>
                        <span className="text-[10px] text-neutral-500 capitalize">{p.role}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-800/80 my-1"></div>

                {/* Profile Links */}
                <div className="space-y-0.5">
                  <Link
                    href={`/@${activeUser.username}`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-neutral-300 hover:bg-neutral-800/70 hover:text-neutral-100 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Public Portfolio</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-neutral-300 hover:bg-neutral-800/70 hover:text-neutral-100 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Dashboard & Analytics</span>
                  </Link>

                  {activeUser.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-amber-300 hover:bg-neutral-800/70 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Moderation</span>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-neutral-300 hover:bg-neutral-800/70 hover:text-neutral-100 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-neutral-300 hover:bg-neutral-900"
            >
              <link.icon className="w-4 h-4 text-neutral-400" />
              <span>{link.name}</span>
            </Link>
          ))}
          <Link
            href={`/@${activeUser.username}`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-neutral-300 hover:bg-neutral-900"
          >
            <User className="w-4 h-4 text-neutral-400" />
            <span>My Portfolio</span>
          </Link>
        </div>
      )}
    </header>
  );
};
