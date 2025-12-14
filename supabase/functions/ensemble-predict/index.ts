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
  
  // Extended list of credible news sources
  const credibleSources = [
    'nytimes.com', 'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com', 'theguardian.com',
    'washingtonpost.com', 'wsj.com', 'cnn.com', 'npr.org', 'time.com',
    'bloomberg.com', 'ft.com', 'economist.com', 'aljazeera.com', 'forbes.com',
    'newsweek.com', 'usatoday.com', 'cbsnews.com', 'nbcnews.com', 'abcnews.go.com',
    'politico.com', 'theatlantic.com', 'newyorker.com', 'latimes.com', 'chicagotribune.com',
    'pbs.org', 'c-span.org', 'nature.com', 'sciencemag.org', 'scientificamerican.com'
  ];
  
  // Known misinformation/satire sites
  const suspiciousSources = [
    'theonion.com', 'babylonbee.com', 'clickhole.com', 'infowars.com', 'naturalnews.com',
    'beforeitsnews.com', 'yournewswire.com', 'worldnewsdailyreport.com'
  ];
  
  let sourceContext = "";
  let sourceWeight = 0;
  
  if (sourceUrl) {
    const urlLower = sourceUrl.toLowerCase();
    const isCredible = credibleSources.some(domain => urlLower.includes(domain));
    const isSuspicious = suspiciousSources.some(domain => urlLower.includes(domain));
    
    if (isCredible) {
      sourceContext = `\n\nCRITICAL SOURCE CONTEXT: This content is from a VERIFIED CREDIBLE news source (${sourceUrl}). Major news organizations have editorial standards, fact-checking processes, and legal accountability. Unless there are OBVIOUS signs of satire or the content contradicts basic facts, this should be classified as REAL.`;
      sourceWeight = 0.3; // Boost confidence for credible sources
    } else if (isSuspicious) {
      sourceContext = `\n\nWARNING: This content is from a KNOWN MISINFORMATION or SATIRE source (${sourceUrl}). Apply extra scrutiny and lean toward FAKE unless the content is clearly factual.`;
      sourceWeight = -0.2; // Reduce confidence
    }
  }
  
  const systemPrompt = `You are an expert fact-checker and news verification specialist with extensive training in journalism, media literacy, and misinformation detection.

ACCURACY IS PARAMOUNT - Follow these rules strictly:

1. SOURCE CREDIBILITY (HIGHEST PRIORITY):
   - Content from established news organizations (NYT, BBC, Reuters, AP, CNN, etc.) should be presumed REAL
   - These organizations have editorial oversight, fact-checking, and legal accountability
   - Do NOT assume breaking news or celebrity deaths are fake when from credible sources

2. CONTENT ANALYSIS MARKERS:
   REAL NEWS indicators:
   - Professional journalistic writing with proper attribution
   - Specific quotes from named sources, officials, or representatives
   - Verifiable details (dates, locations, specific numbers)
   - Balanced reporting showing multiple perspectives
   - Proper context and background information
   - Follows AP/Reuters style guidelines
   
   FAKE NEWS indicators:
   - Sensationalist headlines with excessive punctuation (!!!)
   - No verifiable sources or "anonymous insider" only
   - Emotionally manipulative language designed to provoke outrage
   - Logical impossibilities or contradictions
   - Claims that are too convenient for a political narrative
   - Poor grammar/spelling in supposedly professional news
   - Completely fabricated events with no corroboration

3. CLASSIFICATION RULES:
   - When in doubt between credible-looking content, favor REAL
   - Satire clearly labeled as satire = REAL (it's honest about being satire)
   - Opinion pieces from news sites = REAL (they're labeled as opinion)
   - Unverified claims from unknown sources = FAKE

Respond ONLY in this exact JSON format:
{
  "label": "FAKE" or "REAL",
  "confidence": 0.0 to 1.0,
  "reasoning": "Concise explanation focusing on key evidence"
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
