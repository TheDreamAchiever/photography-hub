import React from "react";
import Link from "next/link";
import { Camera, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-800/80 bg-neutral-950 text-neutral-400 text-xs font-sans mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-neutral-100">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono font-medium tracking-tight text-neutral-200 uppercase">
                Photography<span className="text-neutral-500">/</span>Hub
              </span>
            </div>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-xs">
              The minimalist platform for fine art photographers to showcase, analyze with Gemini AI, and license work.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Powered by Google Gemini 2.5 & Supabase</span>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">Galleries</h4>
            <ul className="space-y-2">
              {["Landscape", "Street & Urban", "Fine Art Portrait", "Architecture", "Nature & Macro", "Astrophotography"].map((cat) => (
                <li key={cat}>
                  <Link href={`/explore?category=${encodeURIComponent(cat.split(" ")[0])}`} className="hover:text-neutral-200 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">Creator Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/upload" className="hover:text-neutral-200 transition-colors">
                  AI Auto-Tagging & EXIF
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-neutral-200 transition-colors">
                  Semantic Visual Search
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-neutral-200 transition-colors">
                  Photographer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-neutral-200 transition-colors">
                  Camera Gear Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Ethics */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">Standards</h4>
            <ul className="space-y-2 text-neutral-500">
              <li>Commercial & Editorial Licenses</li>
              <li>EXIF Metadata Integrity</li>
              <li>Responsible Vision AI Protocol</li>
              <li>High-Res Archival Proofing</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-neutral-800/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-600 font-mono">
          <p>© {new Date().getFullYear()} Photography-Hub. Designed with pure minimalism.</p>
          <div className="flex items-center gap-4">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>pgvector Semantic Engine</span>
            <span>•</span>
            <span>Google Gemini Vision</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
