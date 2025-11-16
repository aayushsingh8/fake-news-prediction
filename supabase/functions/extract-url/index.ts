import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_TOKEN = Deno.env.get("HF_TOKEN");
const MODEL_ID = "jy46604790/Fake-News-Bert-Detect";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

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

    if (!HF_TOKEN) {
      console.error("HF_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "HF_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call HF Router API
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
        extracted_text: cleanedText.substring(0, 1000), // Return first 1000 chars
        prediction: {
          text: cleanedText,
          label,
          score,
          raw,
        },
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
