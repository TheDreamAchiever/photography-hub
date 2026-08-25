import { NextRequest, NextResponse } from "next/server";
import { generateCaptionAndTags } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, title } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data (base64 or URL) is required" },
        { status: 400 }
      );
    }

    const result = await generateCaptionAndTags(image, title);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/ai/caption-tags:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
