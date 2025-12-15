import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
];

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

function cleanText(text: string): string {
  let cleaned = text.replace(/https?:\/\/\S+/gi, "");
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,!?'-]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

async function extractArticle(url: string): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < USER_AGENTS.length; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to fetch: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENTS[attempt],
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout for speed
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied by website");
        }
        if (response.status >= 500 && attempt < USER_AGENTS.length - 1) {
          lastError = new Error(`Server error ${response.status}`);
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      if (!doc) {
        throw new Error("Failed to parse HTML");
      }

      // Remove unwanted elements
      const unwanted = ["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"];
      unwanted.forEach((tag) => {
        const elements = doc.querySelectorAll(tag);
        elements.forEach((el) => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      });

      // Try to find main content
      const selectors = ["article", '[role="main"]', ".article-content", ".post-content", ".entry-content", "main"];

      let content = "";
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          content = element.textContent || "";
          break;
        }
      }

      if (!content) {
        const body = doc.querySelector("body");
        content = body?.textContent || "";
      }

      return content.trim();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      if (attempt < USER_AGENTS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }
    }
  }
  
  throw lastError || new Error("Failed to extract content");
}

// Fast prediction using Gemini Flash for speed + accuracy
async function fastPredict(text: string, sourceUrl: string) {
  console.log("Running fast prediction...");
  
  // Comprehensive source credibility
  const tier1Sources = [
    'nytimes.com', 'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com',
    'washingtonpost.com', 'wsj.com', 'ft.com', 'economist.com', 'theguardian.com',
    'pbs.org', 'npr.org', 'c-span.org'
  ];
  
  const tier2Sources = [
    'cnn.com', 'nbcnews.com', 'cbsnews.com', 'abcnews.go.com', 'time.com',
    'bloomberg.com', 'forbes.com', 'aljazeera.com', 'politico.com', 'theatlantic.com',
    'newyorker.com', 'latimes.com', 'usatoday.com', 'newsweek.com', 'axios.com',
    'indianexpress.com', 'thehindu.com', 'hindustantimes.com', 'ndtv.com',
    'timesofindia.indiatimes.com', 'livemint.com', 'thewire.in', 'scroll.in',
    'news18.com', 'deccanherald.com', 'telegraphindia.com', 'tribuneindia.com',
    'firstpost.com', 'moneycontrol.com', 'dnaindia.com', 'india.com',
    'thequint.com', 'newslaundry.com', 'businesstoday.in'
  ];
  
  const misinformationSites = [
    'infowars.com', 'naturalnews.com', 'beforeitsnews.com', 'yournewswire.com',
    'worldnewsdailyreport.com', 'thelastlineofdefense.org', 'abcnews.com.co'
  ];
  
  const urlLower = sourceUrl.toLowerCase();
  let sourceContext = "";
  let sourceCredibility = "unknown";
  
  if (tier1Sources.some(d => urlLower.includes(d))) {
    sourceCredibility = "tier1";
    sourceContext = "SOURCE: TIER 1 - Top credible news organization. Classify as REAL unless obviously fabricated.";
  } else if (tier2Sources.some(d => urlLower.includes(d))) {
    sourceCredibility = "tier2";
    sourceContext = "SOURCE: TIER 2 - Established news organization. Lean toward REAL.";
  } else if (misinformationSites.some(d => urlLower.includes(d))) {
    sourceCredibility = "misinformation";
    sourceContext = "SOURCE: KNOWN MISINFORMATION SITE. Classify as FAKE.";
  } else {
    sourceContext = "SOURCE: Unknown - analyze content carefully.";
  }

  const systemPrompt = `You are an expert fake news detector with 98%+ accuracy. Analyze quickly and accurately.

${sourceContext}
URL: ${sourceUrl}

ACCURACY RULES:
1. Tier 1/2 credible sources = REAL (95%+ confidence) unless content is satirical/fabricated
2. Professional journalism (named sources, dates, balanced reporting) = likely REAL
3. Sensationalist headlines, emotional manipulation, vague sources = likely FAKE
4. Breaking news from credible sources = REAL (don't flag as fake just because surprising)
5. Celebrity/public figure news from credible outlets = typically REAL

RESPOND ONLY with valid JSON (no markdown):
{"label":"REAL","confidence":0.95,"reasoning":"Brief 1-sentence reason"}
or
{"label":"FAKE","confidence":0.95,"reasoning":"Brief 1-sentence reason"}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Classify this news:\n\n${text.substring(0, 5000)}` },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Prediction error:", response.status, errorText);
    throw new Error("Prediction failed");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  console.log("Prediction result:", content);

  try {
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }
    const result = JSON.parse(jsonStr);
    
    // Boost confidence for known sources
    let adjustedScore = result.confidence;
    if (sourceCredibility === "tier1" && result.label === "REAL") {
      adjustedScore = Math.min(0.98, adjustedScore + 0.05);
    } else if (sourceCredibility === "tier2" && result.label === "REAL") {
      adjustedScore = Math.min(0.96, adjustedScore + 0.03);
    } else if (sourceCredibility === "misinformation" && result.label === "FAKE") {
      adjustedScore = Math.min(0.98, adjustedScore + 0.05);
    }
    
    return {
      label: result.label,
      score: adjustedScore,
      explanation: result.reasoning,
      sourceCredibility,
    };
  } catch (e) {
    console.error("Parse error:", e, "Content:", content);
    throw new Error("Failed to parse prediction");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing URL:", url);
    
    // Extract and predict in sequence
    const extractedText = await extractArticle(url);
    const cleanedText = cleanText(extractedText);
    
    console.log("Text length:", cleanedText.length);

    if (cleanedText.length < 50) {
      return new Response(
        JSON.stringify({ error: "Could not extract enough text from this page" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run fast prediction
    const prediction = await fastPredict(cleanedText, url);

    return new Response(
      JSON.stringify({
        text: cleanedText.substring(0, 500),
        label: prediction.label,
        score: prediction.score,
        explanation: prediction.explanation,
        sourceCredibility: prediction.sourceCredibility,
        url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to process URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
