import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Call ensemble-predict function with the extracted text
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ensembleResponse = await fetch(`${SUPABASE_URL}/functions/v1/ensemble-predict`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: cleanedText }),
    });

    if (!ensembleResponse.ok) {
      const errorText = await ensembleResponse.text();
      console.error("Ensemble prediction error:", ensembleResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Prediction failed", details: errorText }),
        { status: ensembleResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ensembleData = await ensembleResponse.json();

    return new Response(
      JSON.stringify(ensembleData),
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
