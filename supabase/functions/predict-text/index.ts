import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_TOKEN = Deno.env.get("HF_TOKEN");
const MODEL_ID = "jy46604790/Fake-News-Bert-Detect";
const HF_API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

function cleanText(text: string): string {
  // Remove URLs
  let cleaned = text.replace(/https?:\/\/\S+/gi, "");
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  // Remove special characters except basic punctuation
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,!?'-]/g, "");
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid input: text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanedText = cleanText(text);
    console.log("Cleaned text length:", cleanedText.length);

    if (!HF_TOKEN) {
      console.error("HF_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "HF_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Hugging Face Router API (NEW ENDPOINT)
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
        JSON.stringify({ 
          error: "Model inference failed", 
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const predictions = await response.json();
    console.log("Raw predictions:", predictions);

    // Parse the predictions - HF returns array of label-score pairs
    let label = "UNKNOWN";
    let score = 0;
    let raw = predictions;

    if (Array.isArray(predictions) && predictions.length > 0) {
      // Find the prediction with highest score
      const topPrediction = predictions.reduce((prev: any, current: any) => 
        (current.score > prev.score) ? current : prev
      );

      // Map label
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
    console.error("Error in predict-text:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
