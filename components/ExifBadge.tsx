import React from "react";
import { Camera, Aperture, Clock, Zap } from "lucide-react";
import { Photo, EXIFData } from "@/types";

interface ExifBadgeProps {
  photo?: Partial<Photo>;
  exif?: EXIFData;
  compact?: boolean;
  className?: string;
}

export const ExifBadge: React.FC<ExifBadgeProps> = ({ photo, exif, compact = false, className = "" }) => {
  const camera = photo?.camera_model || exif?.model || photo?.exif?.model;
  const lens = photo?.lens || exif?.lens || photo?.exif?.lens;
  const aperture = photo?.aperture || exif?.aperture || photo?.exif?.aperture;
  const shutter = photo?.shutter_speed || exif?.shutterSpeed || photo?.exif?.shutterSpeed;
  const iso = photo?.iso || exif?.iso || photo?.exif?.iso;

  if (!camera && !aperture && !shutter && !iso) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-[11px] font-mono text-neutral-300 bg-neutral-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-800/80 ${className}`}>
        {camera && <span className="truncate max-w-[120px]">{camera}</span>}
        {camera && (aperture || shutter) && <span className="text-neutral-600">•</span>}
        {aperture && <span>{aperture}</span>}
        {shutter && <span>{shutter}</span>}
        {iso && <span>ISO {iso}</span>}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-neutral-900/70 border border-neutral-800/80 font-mono text-xs ${className}`}>
      {camera && (
        <div className="flex items-center gap-2 text-neutral-300">
          <Camera className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <div className="truncate">
            <span className="block text-[10px] text-neutral-500 uppercase">Camera</span>
            <span className="truncate text-neutral-200">{camera}</span>
          </div>
        </div>
      )}

      {aperture && (
        <div className="flex items-center gap-2 text-neutral-300">
          <Aperture className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <div>
            <span className="block text-[10px] text-neutral-500 uppercase">Aperture</span>
            <span className="text-neutral-200">{aperture}</span>
          </div>
        </div>
      )}

      {shutter && (
        <div className="flex items-center gap-2 text-neutral-300">
          <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <div>
            <span className="block text-[10px] text-neutral-500 uppercase">Shutter</span>
            <span className="text-neutral-200">{shutter}</span>
          </div>
        </div>
      )}

      {iso && (
        <div className="flex items-center gap-2 text-neutral-300">
          <Zap className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <div>
            <span className="block text-[10px] text-neutral-500 uppercase">ISO</span>
            <span className="text-neutral-200">{iso}</span>
          </div>
        </div>
      )}
    </div>
  );
};
