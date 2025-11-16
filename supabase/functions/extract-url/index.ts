import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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

async function extractArticle(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FakeNewsBot/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) {
    throw new Error("Failed to parse HTML");
  }

  // Remove unwanted elements
  const unwanted = ["script", "style", "nav", "footer", "header", "aside", "iframe"];
  unwanted.forEach((tag) => {
    const elements = doc.querySelectorAll(tag);
    elements.forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  // Try to find main content
  const selectors = [
    "article",
    '[role="main"]',
    ".article-content",
    ".post-content",
    ".entry-content",
    "main",
  ];

  let content = "";
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      content = element.textContent || "";
      break;
    }
  }

  // Fallback to body if no main content found
  if (!content) {
    const body = doc.querySelector("body");
    content = body?.textContent || "";
  }

  return content.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid input: url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Extracting article from:", url);
    const extractedText = await extractArticle(url);
    const cleanedText = cleanText(extractedText);

    if (!cleanedText) {
      return new Response(
        JSON.stringify({ error: "Failed to extract article content" }),
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
      JSON.stringify({
        extracted_text: cleanedText.substring(0, 1000),
        prediction: ensembleData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in extract-url:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
