import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ expandedTags: [], mood: "", intent: "" });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        expandedTags: query.toLowerCase().split(/\s+/),
        mood: "Atmospheric",
        intent: query,
      });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `You are a semantic photography search engine.
A user entered the natural language search query: "${query}".

Analyze the visual, emotional, and stylistic intent of this query.
Respond ONLY with a valid JSON object matching this schema (no markdown, no backticks):
{
  "intent": "Brief description of the visual scene the user is looking for",
  "mood": "Dominant emotional mood (e.g. Melancholic, Radiant, Serene, Moody, Cyberpunk)",
  "suggestedCategory": "One of: Landscape, Street, Portrait, Architecture, Nature, Wildlife, Abstract, Film/Analog",
  "expandedTags": ["Array of 8-12 synonyms, related visual keywords, lighting types, and subjects that match this scene"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
    });

    const text = response.text?.trim() || "";
    const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Semantic search error:", error);
    return NextResponse.json({
      expandedTags: [],
      mood: "Natural",
      intent: "Visual search",
    });
  }
}
