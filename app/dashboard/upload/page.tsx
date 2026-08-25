"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  UploadCloud, 
  Sparkles, 
  Camera, 
  Tag, 
  Check, 
  X, 
  Sliders, 
  Image as ImageIcon, 
  Plus, 
  Layers, 
  HelpCircle,
  FolderHeart
} from "lucide-react";
import { parseExifFromBlob } from "@/lib/exif";
import { DataService } from "@/lib/dataService";
import { useToast } from "@/components/Toast";
import { EXIFData, Album, Photo } from "@/types";

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File & Preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form Fields
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Landscape");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<number>(45);
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [aiDescription, setAiDescription] = useState("");

  // Extracted EXIF state
  const [exif, setExif] = useState<EXIFData | null>(null);

  const CATEGORIES = [
    "Landscape",
    "Street",
    "Portrait",
    "Architecture",
    "Nature",
    "Wildlife",
    "Astrophotography",
    "Film/Analog",
    "Abstract",
  ];

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Validate size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      toast("Image must be smaller than 25MB", "error");
      return;
    }

    setSelectedFile(file);

    // Read preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);

    // Extract EXIF client-side
    try {
      const parsedExif = await parseExifFromBlob(file);
      setExif(parsedExif);
      if (parsedExif.model) {
        toast(`EXIF detected: ${parsedExif.make || ""} ${parsedExif.model}`, "info");
      }
    } catch (err) {
      console.warn("EXIF extraction error:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeWithGemini = async () => {
    if (!imagePreview) return;
    setIsAnalyzingAi(true);

    try {
      const res = await fetch("/api/ai/caption-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          title: title || undefined,
        }),
      });

      if (!res.ok) throw new Error("Gemini analysis failed");
      const result = await res.json();

      if (result.title && !title) setTitle(result.title);
      if (result.caption) setCaption(result.caption);
      if (result.ai_tags) setTags(result.ai_tags);
      if (result.category) setCategory(result.category);
      if (result.color_palette) setColorPalette(result.color_palette);
      if (result.ai_description) setAiDescription(result.ai_description);

      toast("Gemini vision analysis generated tags & caption!", "success");
    } catch (error) {
      console.error(error);
      toast("Gemini analysis failed; using default presets.", "error");
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const addTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview && !selectedFile) {
      toast("Please select an image file first", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    // Simulate progress animation
    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 25, 90));
    }, 200);

    try {
      // Save photo to unified data layer (Supabase + local store)
      const saved = await DataService.savePhoto({
        title: title || "Fine Art Capture",
        storage_path: imagePreview || "",
        thumbnail_path: imagePreview || "",
        caption,
        category,
        location: location || "Studio",
        price,
        is_public: visibility === "public",
        ai_tags: tags.length > 0 ? tags : ["Photography", category],
        ai_description: aiDescription,
        color_palette: colorPalette.length > 0 ? colorPalette : ["#18181b", "#71717a", "#ffffff"],
        exif: exif || undefined,
        camera_make: exif?.make,
        camera_model: exif?.model,
        lens: exif?.lens,
        focal_length: exif?.focalLength,
        aperture: exif?.aperture,
        shutter_speed: exif?.shutterSpeed,
        iso: exif?.iso,
      });

      clearInterval(interval);
      setUploadProgress(100);
      toast("Photograph published successfully!", "success");
      setTimeout(() => {
        router.push(`/photo/${saved.id}`);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      toast("Upload failed", "error");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header */}
      <div className="border-b border-neutral-800/80 pb-5">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Creator Studio</span>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100 mt-0.5">
          Upload Master Photograph
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Drag & drop RAW/JPEG/WebP images up to 25MB. EXIF metadata is parsed instantly, and Gemini AI auto-generates tags.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column (5 Cols): Drag & Drop Zone + EXIF Specs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer aspect-[4/3] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center overflow-hidden ${
              imagePreview
                ? "border-neutral-700 bg-neutral-950"
                : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600 hover:bg-neutral-900/70"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
              }}
            />

            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                  <UploadCloud className="w-8 h-8 text-neutral-300 mb-2" />
                  <span className="text-xs font-mono text-neutral-200">Click or drag to replace image</span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 mx-auto flex items-center justify-center text-neutral-300">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-200">
                    Click to browse or drop photograph here
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono mt-1">
                    Supports JPEG, PNG, WebP, TIFF (Max 25MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Auto-Analysis Trigger Button */}
          {imagePreview && (
            <button
              type="button"
              onClick={handleAnalyzeWithGemini}
              disabled={isAnalyzingAi}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-amber-400 ${isAnalyzingAi ? "animate-spin" : ""}`} />
              <span>{isAnalyzingAi ? "Gemini is analyzing visual features..." : "Auto-Generate AI Title, Caption & Tags"}</span>
            </button>
          )}

          {/* Extracted EXIF Preview */}
          {exif && (
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
                <Camera className="w-4 h-4 text-neutral-500" />
                <span className="uppercase text-[10px] tracking-wider text-neutral-500">Auto-Detected EXIF</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-300">
                {exif.model && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block">CAMERA</span>
                    <span className="truncate block">{exif.model}</span>
                  </div>
                )}
                {exif.lens && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block">LENS</span>
                    <span className="truncate block">{exif.lens}</span>
                  </div>
                )}
                {exif.aperture && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block">APERTURE</span>
                    <span>{exif.aperture}</span>
                  </div>
                )}
                {exif.shutterSpeed && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block">SHUTTER</span>
                    <span>{exif.shutterSpeed}</span>
                  </div>
                )}
                {exif.iso && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block">ISO</span>
                    <span>{exif.iso}</span>
                  </div>
                )}
                {exif.focalLength && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block">FOCAL LENGTH</span>
                    <span>{exif.focalLength}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (7 Cols): Metadata, AI Tags, Pricing, Publishing */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-400">Photo Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nordic Solitude at First Dawn"
              required
              className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 text-sm focus:outline-none focus:border-neutral-600"
            />
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-400">Editorial Caption / Story</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="The visual story, technical challenges, or poetic context behind the shot..."
              rows={3}
              className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600 leading-relaxed"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Genre / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-neutral-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lofoten, Norway"
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* AI Semantic Tags Chip Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-neutral-400">
              AI Tags & Keywords ({tags.length})
            </label>
            
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 min-h-[44px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-neutral-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(newTagInput);
                    }
                  }}
                  placeholder="+ Add tag..."
                  className="bg-transparent text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none w-24"
                />
              </div>
            </div>
          </div>

          {/* Price & Visibility Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">License Base Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-mono">$</span>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 text-xs font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-neutral-400">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-neutral-600"
              >
                <option value="public">Public (Visible in Explore)</option>
                <option value="unlisted">Unlisted (Direct link only)</option>
                <option value="private">Private (Portfolio owner only)</option>
              </select>
            </div>
          </div>

          {/* Upload Progress bar */}
          {isUploading && (
            <div className="space-y-1 pt-2 animate-fade-in font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Publishing master image to Supabase Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-neutral-100 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-mono"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !imagePreview}
              className="px-6 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 font-medium text-xs hover:bg-white active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isUploading ? "Publishing..." : "Publish Photograph"}</span>
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
