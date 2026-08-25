import exifr from "exifr";
import { EXIFData } from "@/types";

export async function parseExifFromBlob(file: File | Blob): Promise<EXIFData> {
  try {
    const raw = await exifr.parse(file, [
      "Make",
      "Model",
      "LensModel",
      "LensMake",
      "FocalLength",
      "FNumber",
      "ExposureTime",
      "ISO",
      "DateTimeOriginal",
      "Software",
      "ExifImageWidth",
      "ExifImageHeight",
    ]);

    if (!raw) {
      return {};
    }

    // Format Shutter Speed (e.g., 0.008 -> 1/125s)
    let shutterStr: string | undefined = undefined;
    if (raw.ExposureTime) {
      if (raw.ExposureTime < 1) {
        shutterStr = `1/${Math.round(1 / raw.ExposureTime)}s`;
      } else {
        shutterStr = `${raw.ExposureTime}s`;
      }
    }

    // Format Aperture (e.g., 2.8 -> f/2.8)
    let apertureStr: string | undefined = undefined;
    if (raw.FNumber) {
      apertureStr = `f/${raw.FNumber.toFixed(1).replace(/\.0$/, "")}`;
    }

    // Format Focal length
    let focalStr: string | undefined = undefined;
    if (raw.FocalLength) {
      focalStr = `${Math.round(raw.FocalLength)}mm`;
    }

    return {
      make: raw.Make?.trim(),
      model: raw.Model?.trim(),
      lens: raw.LensModel?.trim() || raw.LensMake?.trim(),
      focalLength: focalStr,
      aperture: apertureStr,
      shutterSpeed: shutterStr,
      iso: raw.ISO ? Number(raw.ISO) : undefined,
      software: raw.Software?.trim(),
      dateTime: raw.DateTimeOriginal ? new Date(raw.DateTimeOriginal).toISOString().split("T")[0] : undefined,
      dimensions: raw.ExifImageWidth && raw.ExifImageHeight ? {
        width: raw.ExifImageWidth,
        height: raw.ExifImageHeight,
      } : undefined,
    };
  } catch (error) {
    console.warn("Could not parse EXIF from image:", error);
    return {};
  }
}
