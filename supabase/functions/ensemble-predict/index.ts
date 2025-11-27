import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_TOKEN = Deno.env.get("HF_TOKEN");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const MODEL_ID = "jy46604790/Fake-News-Bert-Detect";
const HF_API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

function cleanText(text: string): string {
  let cleaned = text.replace(/https?:\/\/\S+/gi, "");
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,!?'-]/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

async function getBertPrediction(text: string) {
  console.log("Calling BERT model...");
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("BERT API error:", response.status, errorText);
    return null;
  }

  const predictions = await response.json();
  console.log("BERT predictions:", predictions);

  if (Array.isArray(predictions) && predictions.length > 0) {
    const topPrediction = predictions.reduce((prev: any, current: any) =>
      current.score > prev.score ? current : prev
    );

    let label = "UNKNOWN";
    if (topPrediction.label.toLowerCase().includes("fake") || topPrediction.label === "LABEL_0") {
      label = "FAKE";
    } else if (topPrediction.label.toLowerCase().includes("real") || topPrediction.label === "LABEL_1") {
      label = "REAL";
    }

    return {
      label,
      score: topPrediction.score,
      raw: predictions,
    };
  }

  return null;
}

async function getLovableAIPrediction(text: string) {
  console.log("Calling Lovable AI (Gemini Pro)...");
  
  const systemPrompt = `You are an expert fake news prediction system with deep knowledge of journalism, fact-checking, and misinformation patterns.

CRITICAL INSTRUCTION: Be EXTREMELY careful and accurate. Default to REAL unless you have strong evidence of fakeness.

Analyze the given text using these sophisticated criteria:

INDICATORS OF REAL NEWS:
1. Specific dates, locations, and verifiable details
2. Attribution to credible sources or official statements
3. Neutral, factual tone without excessive emotion
4. Consistent with known events and timelines
5. Multiple sources or confirmable facts
6. Professional writing quality
7. Reasonable claims that align with reality
8. Official announcements or statements

INDICATORS OF FAKE NEWS:
1. Extraordinary claims with NO credible sources
2. Heavy emotional manipulation (fear, outrage, shock)
3. Completely fabricated events or people
4. Obvious logical contradictions
5. Misleading headlines that contradict content
6. Claims that contradict well-established facts
7. Anonymous or suspicious sources only
8. Too sensational to be true with no evidence

IMPORTANT GUIDELINES:
- Recent celebrity deaths, accidents, or events CAN be real - verify plausibility
- News about public figures should be marked REAL if it contains specific details
- Don't mark news as FAKE just because it's negative or surprising
- Consider the context and check if the claims are reasonable
- When in doubt between 0.4-0.6 confidence, lean toward REAL

Respond ONLY in this exact JSON format:
{
  "label": "FAKE" or "REAL",
  "confidence": 0.0 to 1.0,
  "reasoning": "detailed explanation of your decision"
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this news text carefully and determine if it's FAKE or REAL:\n\n${text}` },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);
    return null;
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  console.log("Lovable AI response:", content);

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }
    const result = JSON.parse(jsonStr);
    
    return {
      label: result.label,
      score: result.confidence,
      reasoning: result.reasoning,
    };
  } catch (e) {
    console.error("Failed to parse Lovable AI response:", e);
    return null;
  }
}

function ensembleVoting(bertResult: any, aiResult: any) {
  // Weighted ensemble: BERT (20%) + Lovable AI (80%)
  // Lovable AI (Gemini Pro) gets much higher weight for better accuracy
  const bertWeight = 0.2;
  const aiWeight = 0.8;

  if (!bertResult && !aiResult) {
    return {
      label: "UNKNOWN",
      confidence: 0,
      explanation: "Both models failed to predict",
    };
  }

  if (!bertResult) {
    return {
      label: aiResult.label,
      confidence: aiResult.score * aiWeight,
      explanation: `Only AI model available: ${aiResult.reasoning}`,
      models: { ai: aiResult },
    };
  }

  if (!aiResult) {
    return {
      label: bertResult.label,
      confidence: bertResult.score * bertWeight,
      explanation: "Only BERT model available",
      models: { bert: bertResult },
    };
  }

  // Calculate weighted scores for FAKE
  const bertFakeScore = bertResult.label === "FAKE" ? bertResult.score : (1 - bertResult.score);
  const aiFakeScore = aiResult.label === "FAKE" ? aiResult.score : (1 - aiResult.score);
  
  const ensembleFakeScore = (bertFakeScore * bertWeight) + (aiFakeScore * aiWeight);
  const finalLabel = ensembleFakeScore > 0.5 ? "FAKE" : "REAL";
  const finalConfidence = ensembleFakeScore > 0.5 ? ensembleFakeScore : (1 - ensembleFakeScore);

  return {
    label: finalLabel,
    confidence: finalConfidence,
    explanation: aiResult.reasoning || "Ensemble prediction from BERT + AI models",
    models: {
      bert: bertResult,
      ai: aiResult,
    },
    weights: {
      bert: bertWeight,
      ai: aiWeight,
    },
  };
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

    if (!HF_TOKEN || !LOVABLE_API_KEY) {
      console.error("Missing API keys");
      return new Response(
        JSON.stringify({ error: "API keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run both models in parallel
    const [bertResult, aiResult] = await Promise.all([
      getBertPrediction(cleanedText),
      getLovableAIPrediction(cleanedText),
    ]);

    // Combine predictions using ensemble voting
    const ensembleResult = ensembleVoting(bertResult, aiResult);

    return new Response(
      JSON.stringify({
        text: cleanedText,
        label: ensembleResult.label,
        score: ensembleResult.confidence,
        explanation: ensembleResult.explanation,
        ensemble: ensembleResult,
        raw: {
          bert: bertResult,
          ai: aiResult,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ensemble-predict:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
