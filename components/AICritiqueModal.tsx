"use client";

import React, { useState } from "react";
import { Sparkles, X, Sliders, Check, ArrowUpRight, Award, Zap, Compass, Sun, Palette, Cpu } from "lucide-react";
import { Photo, AICritique } from "@/types";

interface AICritiqueModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePhotoCritique?: (critique: AICritique) => void;
}

export const AICritiqueModal: React.FC<AICritiqueModalProps> = ({
  photo,
  isOpen,
  onClose,
  onUpdatePhotoCritique,
}) => {
  const [critique, setCritique] = useState<AICritique | null>(photo.ai_critique || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPreset, setCopiedPreset] = useState(false);

  if (!isOpen) return null;

  const handleGenerateCritique = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photo.storage_path,
          metadata: {
            camera: photo.camera_model,
            lens: photo.lens,
            iso: photo.iso,
            aperture: photo.aperture,
            shutter: photo.shutter_speed,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to generate critique");
      const data = await res.json();
      setCritique(data);
      if (onUpdatePhotoCritique) {
        onUpdatePhotoCritique(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAdjustments = () => {
    if (!critique?.recommendedAdjustments) return;
    const text = Object.entries(critique.recommendedAdjustments)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedPreset(true);
    setTimeout(() => setCopiedPreset(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-neutral-100">AI Curator Critique</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Gemini 2.5 Vision
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Technical evaluation for &ldquo;{photo.title}&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!critique && !isLoading ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700 mx-auto flex items-center justify-center text-amber-400">
              <Award className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-medium text-neutral-200">Request Fine Art Evaluation</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Google Gemini will analyze your composition, tonal lighting, color harmony, and EXIF settings to give detailed judging feedback and Lightroom development tips.
              </p>
            </div>
            <button
              onClick={handleGenerateCritique}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 font-medium text-xs hover:bg-white active:scale-95 transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Generate AI Critique</span>
            </button>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-neutral-700 border-t-amber-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-neutral-300">Analyzing composition, lighting, and chromatic tonality...</p>
            <p className="text-xs text-neutral-500 font-mono">Gemini Vision Multi-modal Evaluation Engine</p>
          </div>
        ) : critique ? (
          <div className="space-y-6 animate-fade-in text-xs">
            
            {/* Overall Score Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Overall Rating</span>
                <p className="text-neutral-300 text-sm mt-1 leading-relaxed">{critique.summary}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right font-mono">
                  <span className="text-3xl font-bold text-neutral-100">{critique.overallScore}</span>
                  <span className="text-neutral-500 text-sm">/100</span>
                </div>
              </div>
            </div>

            {/* Score Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Composition */}
              <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
                    <Compass className="w-3.5 h-3.5 text-blue-400" /> Composition & Framing
                  </span>
                  <span className="text-neutral-300 font-bold">{critique.composition.score}/100</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${critique.composition.score}%` }}
                  />
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed pt-1">
                  {critique.composition.feedback}
                </p>
              </div>

              {/* Lighting */}
              <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Lighting & Contrast
                  </span>
                  <span className="text-neutral-300 font-bold">{critique.lighting.score}/100</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${critique.lighting.score}%` }}
                  />
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed pt-1">
                  {critique.lighting.feedback}
                </p>
              </div>

              {/* Color Grading */}
              <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
                    <Palette className="w-3.5 h-3.5 text-emerald-400" /> Color Tonality
                  </span>
                  <span className="text-neutral-300 font-bold">{critique.colorGrading.score}/100</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${critique.colorGrading.score}%` }}
                  />
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed pt-1">
                  {critique.colorGrading.feedback}
                </p>
              </div>

              {/* Technical */}
              <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" /> Technical Sharpness
                  </span>
                  <span className="text-neutral-300 font-bold">{critique.technical.score}/100</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${critique.technical.score}%` }}
                  />
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed pt-1">
                  {critique.technical.feedback}
                </p>
              </div>

            </div>

            {/* Actionable Tips */}
            {critique.actionableTips && critique.actionableTips.length > 0 && (
              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-2">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Actionable Curator Suggestions
                </h4>
                <ul className="space-y-1.5 pt-1">
                  {critique.actionableTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-neutral-300 text-xs">
                      <span className="text-neutral-500 font-mono">0{idx + 1}.</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Post-Processing Presets */}
            {critique.recommendedAdjustments && (
              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-neutral-400" /> Suggested RAW / Lightroom Adjustments
                  </h4>
                  <button
                    onClick={copyAdjustments}
                    className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {copiedPreset ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <span>Copy Preset Parameters</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  {Object.entries(critique.recommendedAdjustments).map(([key, val]) => (
                    <div key={key} className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                      <span className="text-neutral-500 uppercase">{key}</span>
                      <span className="text-neutral-200 font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Re-run button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateCritique}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
              >
                Re-evaluate with Gemini
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};
