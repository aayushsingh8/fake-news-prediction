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

async function getMLPrediction(text: string, sourceUrl?: string) {
  console.log("Calling ML model (Gemini Pro)...");
  
  // Check if source is from a credible news organization
  const credibleSources = [
    'nytimes.com', 'bbc.com', 'reuters.com', 'apnews.com', 'theguardian.com',
    'washingtonpost.com', 'wsj.com', 'cnn.com', 'npr.org', 'time.com',
    'bloomberg.com', 'ft.com', 'economist.com', 'aljazeera.com', 'forbes.com',
    'newsweek.com', 'usatoday.com', 'cbsnews.com', 'nbcnews.com', 'abcnews.go.com',
    'politico.com', 'theatlantic.com', 'newyorker.com', 'latimes.com', 'chicagotribune.com'
  ];
  
  let sourceContext = "";
  if (sourceUrl) {
    const isCredible = credibleSources.some(domain => sourceUrl.toLowerCase().includes(domain));
    if (isCredible) {
      sourceContext = `\n\nIMPORTANT CONTEXT: This content is from a verified credible news source (${sourceUrl}). Major news organizations have editorial standards, fact-checking processes, and legal accountability. Content from these sources should be strongly presumed REAL unless there are obvious signs of satire, opinion pieces, or the content explicitly contradicts the source's reporting style.`;
    }
  }
  
  const systemPrompt = `You are an expert news verification system with deep knowledge of journalism, fact-checking, and media literacy.

CRITICAL INSTRUCTIONS:
1. CREDIBLE SOURCES: Content from major established news organizations (NY Times, BBC, Reuters, AP, Washington Post, etc.) should be strongly presumed REAL. These organizations have:
   - Professional editorial standards and fact-checking
   - Legal accountability for false reporting
   - Decades of journalistic reputation
   - Multiple layers of review before publication

2. DO NOT assume celebrity deaths or major events are hoaxes when reported by credible sources
3. Focus on journalistic quality markers, not just claim sensationalism
4. Consider the writing style, attribution patterns, and editorial standards

INDICATORS OF REAL NEWS FROM CREDIBLE SOURCES:
- Professional journalistic writing style
- Specific attributions (quotes from officials, family, representatives)
- Detailed context and background information
- Consistent with the publication's reporting standards
- Multiple verifiable details (dates, locations, circumstances)
- Quotes from named sources or official statements
- Follow-up details and comprehensive coverage

INDICATORS OF FAKE NEWS:
- Claims from unknown/suspicious sources with no verification
- Extreme emotional manipulation without factual basis
- Complete fabrication of events with zero credible attribution
- Content that contradicts the supposed source's style
- No verifiable details or all sources are "anonymous"
- Logical impossibilities or obvious contradictions
- Appears on known misinformation websites

EVALUATION FRAMEWORK:
1. Source credibility: Is this from a reputable news organization? (HIGH WEIGHT)
2. Journalistic standards: Does it follow professional reporting practices?
3. Verifiable details: Are there specific, checkable facts?
4. Attribution quality: Are sources named and credible?
5. Writing quality: Is it professionally written?

When content is from major news organizations, it should be marked REAL unless there are STRONG indicators of satire, opinion, or fabrication.

Respond ONLY in this exact JSON format:
{
  "label": "FAKE" or "REAL",
  "confidence": 0.0 to 1.0,
  "reasoning": "detailed explanation of your decision based on source credibility and journalistic standards"
}${sourceContext}`;

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
        { role: "user", content: `Analyze this news content carefully and determine if it's FAKE or REAL:\n\n${text}` },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ML model error:", response.status, errorText);
    return null;
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  console.log("ML model response:", content);

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
    console.error("Failed to parse ML model response:", e);
    return null;
  }
}

function ensembleVoting(bertResult: any, mlResult: any) {
  // Weighted ensemble: BERT (20%) + Advanced ML (80%)
  // Advanced ML model gets much higher weight for better accuracy
  const bertWeight = 0.2;
  const mlWeight = 0.8;

  if (!bertResult && !mlResult) {
    return {
      label: "UNKNOWN",
      confidence: 0,
      explanation: "Both models failed to predict",
    };
  }

  if (!bertResult) {
    return {
      label: mlResult.label,
      confidence: mlResult.score * mlWeight,
      explanation: `Only ML model available: ${mlResult.reasoning}`,
      models: { ml: mlResult },
    };
  }

  if (!mlResult) {
    return {
      label: bertResult.label,
      confidence: bertResult.score * bertWeight,
      explanation: "Only BERT model available",
      models: { bert: bertResult },
    };
  }

  // Calculate weighted scores for FAKE
  const bertFakeScore = bertResult.label === "FAKE" ? bertResult.score : (1 - bertResult.score);
  const mlFakeScore = mlResult.label === "FAKE" ? mlResult.score : (1 - mlResult.score);
  
  const ensembleFakeScore = (bertFakeScore * bertWeight) + (mlFakeScore * mlWeight);
  const finalLabel = ensembleFakeScore > 0.5 ? "FAKE" : "REAL";
  const finalConfidence = ensembleFakeScore > 0.5 ? ensembleFakeScore : (1 - ensembleFakeScore);

  return {
    label: finalLabel,
    confidence: finalConfidence,
    explanation: mlResult.reasoning || "Ensemble prediction from BERT + ML models",
    models: {
      bert: bertResult,
      ml: mlResult,
    },
    weights: {
      bert: bertWeight,
      ml: mlWeight,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceUrl } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid input: text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanedText = cleanText(text);
    console.log("Cleaned text length:", cleanedText.length);
    console.log("Source URL:", sourceUrl || "Not provided");

    if (!HF_TOKEN || !LOVABLE_API_KEY) {
      console.error("Missing API keys");
      return new Response(
        JSON.stringify({ error: "API keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run both models in parallel
    const [bertResult, mlResult] = await Promise.all([
      getBertPrediction(cleanedText),
      getMLPrediction(cleanedText, sourceUrl),
    ]);

    // Combine predictions using ensemble voting
    const ensembleResult = ensembleVoting(bertResult, mlResult);

    return new Response(
      JSON.stringify({
        text: cleanedText,
        label: ensembleResult.label,
        score: ensembleResult.confidence,
        explanation: ensembleResult.explanation,
        ensemble: ensembleResult,
        raw: {
          bert: bertResult,
          ml: mlResult,
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
