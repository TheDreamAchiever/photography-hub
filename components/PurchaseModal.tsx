"use client";

import React, { useState } from "react";
import { X, Check, ShieldCheck, Download, Sparkles, CreditCard } from "lucide-react";
import { Photo } from "@/types";
import confetti from "canvas-confetti";
import { useToast } from "./Toast";

interface PurchaseModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
}

interface LicenseTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const TIERS: LicenseTier[] = [
  {
    id: "personal",
    name: "Personal & Social",
    price: 19,
    description: "Ideal for personal websites, wallpapers, and social media presentation.",
    features: ["Up to 4K resolution (3840px)", "Non-commercial attribution license", "Instant full-res download"],
  },
  {
    id: "commercial",
    name: "Commercial & Advertising",
    price: 89,
    description: "Full royalty-free rights for commercial campaigns, brand websites, and apps.",
    features: [
      "Original uncompressed RAW / TIFF quality",
      "Unlimited commercial distribution",
      "Perpetual worldwide rights",
      "No attribution required",
    ],
  },
  {
    id: "print",
    name: "Archival Fine Art Print",
    price: 180,
    description: "Museum-grade Hahnemühle Photo Rag print, hand-signed by the photographer.",
    features: [
      "16x24 inch museum archival print",
      "Signed Certificate of Authenticity",
      "Global insured carbon-neutral shipping",
    ],
  },
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ photo, isOpen, onClose }) => {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>("personal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  if (!isOpen) return null;

  const currentTier = TIERS.find((t) => t.id === selectedTier) || TIERS[0];

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate brief checkout flow
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsProcessing(false);
    setPurchased(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    toast(`License for "${photo.title}" acquired successfully!`, "success");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = photo.storage_path;
    link.download = `${photo.title.replace(/\s+/g, "_")}_highres.jpg`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider">Acquire License / Print</span>
            <h2 className="text-lg font-semibold text-neutral-100 mt-0.5">{photo.title}</h2>
            {photo.profiles && (
              <p className="text-xs text-neutral-400 font-mono">By {photo.profiles.display_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!purchased ? (
          <div className="space-y-6">
            
            {/* Tiers List */}
            <div className="space-y-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    selectedTier === tier.id
                      ? "bg-neutral-800/80 border-neutral-400 ring-1 ring-neutral-400"
                      : "bg-neutral-950/40 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-100">{tier.name}</span>
                        {tier.id === "commercial" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{tier.description}</p>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="text-lg font-bold text-neutral-100">${tier.price}</span>
                      <span className="text-[11px] text-neutral-500 block">USD</span>
                    </div>
                  </div>

                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-3 border-t border-neutral-800/60 text-xs text-neutral-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-[11px]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Checkout Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secure SSL checkout • 100% Artist Payout Guaranteed</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 font-medium text-xs hover:bg-white active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Purchase for ${currentTier.price}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
              <Check className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-neutral-100">License Acquisition Complete</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Thank you for supporting fine art photography. Your high-resolution master file and license certificate are ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 text-xs font-medium hover:bg-white flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Master High-Res</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium hover:bg-neutral-700"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
