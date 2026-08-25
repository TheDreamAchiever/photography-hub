import { NextRequest, NextResponse } from "next/server";
import { generatePhotoCritique } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, metadata } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const critique = await generatePhotoCritique(image, metadata);
    return NextResponse.json(critique);
  } catch (error: any) {
    console.error("Error in /api/ai/critique:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate critique" },
      { status: 500 }
    );
  }
}
