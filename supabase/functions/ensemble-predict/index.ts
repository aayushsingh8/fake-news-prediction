import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_TOKEN = Deno.env.get("HF_TOKEN");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const MODEL_ID = "jy46604790/Fake-News-Bert-Detect";
// Updated to new HuggingFace Router API endpoint
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

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
  console.log("Calling ML model (Gemini 2.5 Pro)...");
  
  // Extended and categorized credible news sources
  const tier1Sources = [
    'nytimes.com', 'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com',
    'washingtonpost.com', 'wsj.com', 'ft.com', 'economist.com', 'theguardian.com',
    'pbs.org', 'npr.org', 'c-span.org'
  ];
  
  const tier2Sources = [
    'cnn.com', 'nbcnews.com', 'cbsnews.com', 'abcnews.go.com', 'time.com',
    'bloomberg.com', 'forbes.com', 'aljazeera.com', 'politico.com', 'theatlantic.com',
    'newyorker.com', 'latimes.com', 'chicagotribune.com', 'usatoday.com',
    'newsweek.com', 'nature.com', 'sciencemag.org', 'scientificamerican.com',
    'axios.com', 'thehill.com', 'foreignpolicy.com', 'vox.com', 'slate.com',
    'indianexpress.com', 'thehindu.com', 'hindustantimes.com', 'ndtv.com',
    'timesofindia.indiatimes.com', 'livemint.com', 'moneycontrol.com',
    'thewire.in', 'scroll.in', 'firstpost.com', 'news18.com', 'india.com',
    'dnaindia.com', 'deccanherald.com', 'telegraphindia.com', 'tribuneindia.com'
  ];
  
  // Known misinformation/satire sites
  const satireSites = [
    'theonion.com', 'babylonbee.com', 'clickhole.com', 'newsthump.com', 
    'thedailymash.co.uk', 'faking-news.com'
  ];
  
  const misinformationSites = [
    'infowars.com', 'naturalnews.com', 'beforeitsnews.com', 'yournewswire.com',
    'worldnewsdailyreport.com', 'dailybuzzlive.com', 'newsbreakshere.com',
    'conservativetribune.com', 'libertywriters.com', 'americannews.com',
    'thelastlineofdefense.org', 'abcnews.com.co', 'dailywire.co', 'usatoday.com.co'
  ];
  
  let sourceContext = "";
  let sourceCredibility = "unknown";
  
  if (sourceUrl) {
    const urlLower = sourceUrl.toLowerCase();
    
    if (tier1Sources.some(domain => urlLower.includes(domain))) {
      sourceCredibility = "tier1";
      sourceContext = `\n\n🔒 SOURCE VERIFICATION: TIER 1 CREDIBLE SOURCE (${sourceUrl})
This is a top-tier news organization with:
- Rigorous editorial standards and fact-checking
- Legal accountability and corrections policies
- Established reputation built over decades
- Professional journalists with verified sourcing

CLASSIFICATION GUIDANCE: Unless the content contains OBVIOUS satire markers or factual impossibilities, classify as REAL. Breaking news from these sources is typically accurate.`;
    } else if (tier2Sources.some(domain => urlLower.includes(domain))) {
      sourceCredibility = "tier2";
      sourceContext = `\n\n✅ SOURCE VERIFICATION: TIER 2 CREDIBLE SOURCE (${sourceUrl})
This is an established news organization with editorial standards.

CLASSIFICATION GUIDANCE: Apply standard analysis. Lean toward REAL unless content shows clear misinformation markers.`;
    } else if (satireSites.some(domain => urlLower.includes(domain))) {
      sourceCredibility = "satire";
      sourceContext = `\n\n🎭 SOURCE VERIFICATION: KNOWN SATIRE SITE (${sourceUrl})
This is a satire/parody publication. Content is intentionally fictional for humor.

CLASSIFICATION GUIDANCE: This is REAL satire (honest about being fiction), not fake news trying to deceive.`;
    } else if (misinformationSites.some(domain => urlLower.includes(domain))) {
      sourceCredibility = "misinformation";
      sourceContext = `\n\n⚠️ SOURCE VERIFICATION: KNOWN MISINFORMATION SOURCE (${sourceUrl})
This site has a documented history of publishing false information.

CLASSIFICATION GUIDANCE: Apply maximum scrutiny. Classify as FAKE unless content can be independently verified.`;
    }
  }
  
  const systemPrompt = `You are an elite fact-checker with expertise in journalism, media literacy, and misinformation detection. Your accuracy rate must exceed 98%.

CRITICAL RULES FOR HIGH ACCURACY:

1. SOURCE CREDIBILITY (40% weight):
   - Tier 1 sources (NYT, BBC, Reuters, AP, WSJ, Guardian, PBS, NPR): Trust by default
   - Tier 2 sources (CNN, Forbes, Bloomberg, etc.): High trust with verification
   - Unknown sources: Neutral stance, analyze content carefully
   - Known misinformation sites: High skepticism

2. CONTENT ANALYSIS (40% weight):
   
   REAL NEWS MARKERS (presence increases REAL probability):
   ✓ Professional AP/Reuters style writing
   ✓ Named sources with verifiable credentials
   ✓ Specific dates, locations, and verifiable details
   ✓ Balanced reporting showing multiple viewpoints
   ✓ Proper attribution and quotes
   ✓ Context and background information
   ✓ Recent events from credible sources (breaking news IS often real)
   ✓ Celebrity/public figure news from credible outlets (deaths, marriages, etc. are typically accurate)
   
   FAKE NEWS MARKERS (presence increases FAKE probability):
   ✗ Sensationalist headlines (ALL CAPS, !!!, "SHOCKING")
   ✗ Anonymous or vague sources only
   ✗ Emotionally manipulative language
   ✗ Claims that are "too perfect" for a political narrative
   ✗ No corroborating sources or links
   ✗ Logical impossibilities or internal contradictions
   ✗ Poor grammar/spelling in "professional" articles
   ✗ Requests for money or personal info
   ✗ Domain names mimicking real news (abcnews.com.co)

3. TEMPORAL CONTEXT (20% weight):
   - Breaking news from credible sources = likely REAL
   - Old debunked stories resurfacing = likely FAKE
   - Future-dated events reported as past = FAKE
   - Current events matching known news cycles = likely REAL

CLASSIFICATION DECISION MATRIX:
- Tier 1 source + professional content = REAL (95%+ confidence)
- Tier 2 source + professional content = REAL (85%+ confidence)  
- Unknown source + professional content = REAL (70% confidence)
- Unknown source + mixed signals = analyze carefully (50-70%)
- Any source + multiple fake markers = FAKE (80%+ confidence)
- Known misinformation source = FAKE (90%+ confidence)

AVOID FALSE POSITIVES:
- Do NOT classify credible breaking news as fake just because it's surprising
- Do NOT assume celebrity deaths/events are fake when from credible sources
- Do NOT penalize opinion pieces clearly labeled as opinion
- Do NOT penalize regional/international news from credible local sources

Respond ONLY in this JSON format:
{
  "label": "FAKE" or "REAL",
  "confidence": 0.0 to 1.0,
  "reasoning": "2-3 sentence explanation citing specific evidence"
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
        { role: "user", content: `Analyze this news content and classify as REAL or FAKE:\n\n${text.substring(0, 8000)}` },
      ],
      temperature: 0.05,
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
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }
    const result = JSON.parse(jsonStr);
    
    // Apply source credibility boost
    let adjustedScore = result.confidence;
    if (sourceCredibility === "tier1" && result.label === "REAL") {
      adjustedScore = Math.min(0.98, adjustedScore + 0.1);
    } else if (sourceCredibility === "misinformation" && result.label === "FAKE") {
      adjustedScore = Math.min(0.98, adjustedScore + 0.1);
    }
    
    return {
      label: result.label,
      score: adjustedScore,
      reasoning: result.reasoning,
      sourceCredibility,
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
