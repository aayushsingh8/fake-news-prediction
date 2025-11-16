import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_TOKEN = Deno.env.get("HF_TOKEN");
const MODEL_ID = "AyushSingh2278/fake-news-detector";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

function cleanText(text: string): string {
  let cleaned = text.replace(/https?:\/\/\S+/gi, "");
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,!?'-]/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Remove data URL prefix if present
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function extractTextFromPDF(bytes: Uint8Array): string {
  // Simple PDF text extraction (for basic PDFs)
  const text = new TextDecoder().decode(bytes);
  const matches = text.match(/\(([^)]+)\)/g);
  if (matches) {
    return matches.map((m) => m.slice(1, -1)).join(" ");
  }
  return "";
}

async function extractText(base64: string, mimeType: string): Promise<string> {
  const bytes = base64ToUint8Array(base64);

  if (mimeType === "text/plain") {
    return new TextDecoder().decode(bytes);
  } else if (mimeType === "application/pdf") {
    return extractTextFromPDF(bytes);
  } else if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // Basic DOC/DOCX text extraction
    const text = new TextDecoder().decode(bytes);
    return text.replace(/[^\x20-\x7E\n]/g, " ");
  }

  return "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, filename, mimeType } = await req.json();

    if (!file || !mimeType) {
      return new Response(
        JSON.stringify({ error: "Invalid input: file and mimeType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing document:", filename, mimeType);

    const extractedText = await extractText(file, mimeType);
    const cleanedText = cleanText(extractedText);

    if (!cleanedText || cleanedText.length < 10) {
      return new Response(
        JSON.stringify({ error: "Failed to extract meaningful text from document" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Extracted text length:", cleanedText.length);

    if (!HF_TOKEN) {
      console.error("HF_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "HF_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Predict using HF Router API (NEW ENDPOINT)
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: cleanedText,
        options: { wait_for_model: true },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Model inference failed", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const predictions = await response.json();
    console.log("Predictions:", predictions);

    let label = "UNKNOWN";
    let score = 0;
    let raw = predictions;

    if (Array.isArray(predictions) && predictions.length > 0) {
      const topPrediction = predictions.reduce((prev: any, current: any) =>
        current.score > prev.score ? current : prev
      );

      if (topPrediction.label.toLowerCase().includes("fake") || topPrediction.label === "LABEL_0") {
        label = "FAKE";
      } else if (topPrediction.label.toLowerCase().includes("real") || topPrediction.label === "LABEL_1") {
        label = "REAL";
      }

      score = topPrediction.score;
    }

    return new Response(
      JSON.stringify({
        text: cleanedText,
        label,
        score,
        raw,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
