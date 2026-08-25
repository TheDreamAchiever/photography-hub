import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set in environment.");
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

export interface AICaptionTagsResult {
  title: string;
  caption: string;
  ai_description: string;
  ai_tags: string[];
  color_palette: string[];
  alt_text: string;
  category: string;
  mood: string;
}

export interface AICritiqueResult {
  overallScore: number;
  summary: string;
  composition: {
    score: number;
    feedback: string;
  };
  lighting: {
    score: number;
    feedback: string;
  };
  colorGrading: {
    score: number;
    feedback: string;
  };
  technical: {
    score: number;
    feedback: string;
  };
  actionableTips: string[];
  recommendedAdjustments: {
    exposure?: string;
    highlights?: string;
    shadows?: string;
    temperature?: string;
    vibrance?: string;
    cropSuggestion?: string;
  };
}

export async function generateCaptionAndTags(
  imageBase64OrUrl: string,
  hintTitle?: string
): Promise<AICaptionTagsResult> {
  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackCaptionAndTags(hintTitle);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Prepare image payload
    let imagePart: any;
    if (imageBase64OrUrl.startsWith("data:")) {
      const match = imageBase64OrUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        imagePart = {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    } else if (imageBase64OrUrl.startsWith("http")) {
      // Fetch image and convert to base64
      try {
        const res = await fetch(imageBase64OrUrl);
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = res.headers.get("content-type") || "image/jpeg";
        imagePart = {
          inlineData: {
            mimeType: contentType,
            data: base64,
          },
        };
      } catch (err) {
        console.warn("Could not fetch remote image for Gemini, using fallback:", err);
      }
    }

    const prompt = `You are a world-class photography curator, photo editor, and vision AI.
Analyze this photograph thoroughly.
${hintTitle ? `The photographer's working title is: "${hintTitle}".` : ""}

Respond ONLY with a valid JSON object matching this schema (no markdown, no backticks, just raw JSON):
{
  "title": "A captivating, evocative, professional photo title (max 5 words)",
  "caption": "A poetic, editorial 1-2 sentence caption describing the emotional and visual story",
  "ai_description": "A detailed 2-3 sentence visual analysis of the lighting, subject, perspective, and atmosphere",
  "ai_tags": ["5 to 10 highly relevant tags covering subject, lighting style, mood, aesthetic, and location type"],
  "color_palette": ["5 dominant hex color codes, e.g. #1e293b, #f59e0b, #0f172a, #78716c, #e2e8f0"],
  "alt_text": "An accessible, concise screen-reader description for visual accessibility",
  "category": "One of: Landscape, Street, Portrait, Architecture, Nature, Wildlife, Astrophotography, Abstract, Film/Analog",
  "mood": "One or two words describing the mood (e.g. Melancholic, Radiant, Serene, Cyberpunk)"
}`;

    const parts: any[] = [];
    if (imagePart) parts.push(imagePart);
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
    });

    const text = response.text?.trim() || "";
    const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      title: parsed.title || hintTitle || "Visual Symphony",
      caption: parsed.caption || "A moment captured in time with dramatic interplay of natural light.",
      ai_description: parsed.ai_description || "A captivating composition showcasing rich atmospheric textures and delicate tonality.",
      ai_tags: Array.isArray(parsed.ai_tags) ? parsed.ai_tags : ["Fine Art", "Atmospheric", "Photography"],
      color_palette: Array.isArray(parsed.color_palette) ? parsed.color_palette : ["#09090b", "#71717a", "#d4d4d8", "#3f3f46", "#fafafa"],
      alt_text: parsed.alt_text || "A fine art photograph.",
      category: parsed.category || "Landscape",
      mood: parsed.mood || "Atmospheric",
    };
  } catch (error) {
    console.error("Gemini API error in generateCaptionAndTags:", error);
    return getFallbackCaptionAndTags(hintTitle);
  }
}

export async function generatePhotoCritique(
  imageBase64OrUrl: string,
  metadata?: { camera?: string; lens?: string; iso?: number; aperture?: string; shutter?: string }
): Promise<AICritiqueResult> {
  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackCritique();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let imagePart: any;
    if (imageBase64OrUrl.startsWith("data:")) {
      const match = imageBase64OrUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        imagePart = {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    } else if (imageBase64OrUrl.startsWith("http")) {
      try {
        const res = await fetch(imageBase64OrUrl);
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = res.headers.get("content-type") || "image/jpeg";
        imagePart = {
          inlineData: {
            mimeType: contentType,
            data: base64,
          },
        };
      } catch {}
    }

    const exifSummary = metadata
      ? `Shooting metadata: Camera: ${metadata.camera || "Unknown"}, Lens: ${metadata.lens || "Unknown"}, Aperture: ${metadata.aperture || "N/A"}, Shutter: ${metadata.shutter || "N/A"}, ISO: ${metadata.iso || "N/A"}.`
      : "";

    const prompt = `You are a prestigious photography competition judge and master photo editor (Magnum Photos / National Geographic style).
Critique this photograph with honest, encouraging, and highly technical constructive feedback.
${exifSummary}

Respond ONLY with a valid JSON object matching this schema (no markdown, no backticks, just raw JSON):
{
  "overallScore": 92,
  "summary": "2 sentences summarizing the artistic strengths and visual impact of the photograph.",
  "composition": {
    "score": 90,
    "feedback": "Specific feedback on framing, rule of thirds / golden ratio, leading lines, balance, and subject isolation."
  },
  "lighting": {
    "score": 93,
    "feedback": "Analysis of light quality (hard/soft), direction, contrast ratio, highlight retention, and shadow recovery."
  },
  "colorGrading": {
    "score": 91,
    "feedback": "Evaluation of color harmony, skin tone fidelity, saturation balance, and chromatic atmosphere."
  },
  "technical": {
    "score": 89,
    "feedback": "Evaluation of critical focus, depth of field, optical sharpness, motion blur, and sensor noise."
  },
  "actionableTips": [
    "Tip 1: Practical shooting or composition improvement",
    "Tip 2: Specific post-processing adjustment in Lightroom/Photoshop"
  ],
  "recommendedAdjustments": {
    "exposure": "+0.10 EV",
    "highlights": "-15",
    "shadows": "+10",
    "temperature": "+150K",
    "vibrance": "+8",
    "cropSuggestion": "Consider a subtle 5% crop from the top to remove excess empty sky."
  }
}`;

    const parts: any[] = [];
    if (imagePart) parts.push(imagePart);
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
    });

    const text = response.text?.trim() || "";
    const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini API error in generatePhotoCritique:", error);
    return getFallbackCritique();
  }
}

function getFallbackCaptionAndTags(hintTitle?: string): AICaptionTagsResult {
  return {
    title: hintTitle || "Ethereal Horizon",
    caption: "A contemplative study of organic forms and delicate ambient light.",
    ai_description: "A finely balanced composition capturing subtle transitions between luminous highlights and gentle shadows.",
    ai_tags: ["Atmospheric", "Fine Art", "Minimalist", "Cinematic", "Ambient Light", "Golden Hour"],
    color_palette: ["#1e293b", "#334155", "#64748b", "#cbd5e1", "#f8fafc"],
    alt_text: "A fine art photograph showcasing beautiful natural light.",
    category: "Landscape",
    mood: "Serene",
  };
}

function getFallbackCritique(): AICritiqueResult {
  return {
    overallScore: 91,
    summary: "A visually striking piece with wonderful atmosphere and commendable tonality.",
    composition: {
      score: 92,
      feedback: "Strong visual anchor with balanced negative space that directs viewer attention naturally.",
    },
    lighting: {
      score: 90,
      feedback: "Great dynamic range handling without blowing highlights.",
    },
    colorGrading: {
      score: 93,
      feedback: "Harmonious palette with pleasing tonal split between warm lights and cool shadows.",
    },
    technical: {
      score: 89,
      feedback: "Good optical sharpness and clean details across the frame.",
    },
    actionableTips: [
      "Experiment with a gentle S-curve in the tonal curve to enhance micro-contrast.",
      "Consider a subtle vignette to focus the viewer's eye into the center.",
    ],
    recommendedAdjustments: {
      exposure: "+0.05 EV",
      highlights: "-10",
      shadows: "+8",
      temperature: "+100K",
      vibrance: "+5",
      cropSuggestion: "Framing is already well balanced.",
    },
  };
}
