import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

function cleanText(text: string): string {
  let cleaned = text.replace(/https?:\/\/\S+/gi, "");
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,!?'-]/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

async function extractArticle(url: string): Promise<string> {
  let lastError: Error | null = null;
  
  // Try with different user agents
  for (let attempt = 0; attempt < USER_AGENTS.length; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENTS[attempt],
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "DNT": "1",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        const statusCode = response.status;
        
        // Don't retry on client errors (400-499) except 429 (rate limit)
        if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
          if (statusCode === 403) {
            throw new Error("Access denied: This website blocks automated access. Try a different news source.");
          } else if (statusCode === 404) {
            throw new Error("Article not found: This URL may be outdated or incorrect. Please verify the URL or try a different article.");
          } else if (statusCode === 402 || statusCode === 451) {
            throw new Error("Paywall detected: This article requires a subscription. Try free news sources like BBC, Reuters, or AP News.");
          } else {
            throw new Error(`Cannot access URL: ${statusCode} ${response.statusText}`);
          }
        }
        
        // Retry on server errors (500-599) or rate limits (429)
        if (attempt < USER_AGENTS.length - 1) {
          lastError = new Error(`Server error (${statusCode}), retrying with different user agent...`);
          console.log(lastError.message);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }
        
        throw new Error(`Failed to fetch URL: ${statusCode} ${response.statusText}`);
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
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error("Request timeout: The website took too long to respond. Try a different article.");
        }
        if (error.message.includes("dns") || error.message.includes("DNS")) {
          throw new Error("Invalid URL: Could not find the website. Please check the URL and try again.");
        }
        if (error.message.includes("connection") || error.message.includes("ECONNREFUSED")) {
          throw new Error("Connection failed: Unable to connect to the website. It may be down or blocking requests.");
        }
        // If it's already a user-friendly error message, throw it
        if (error.message.includes("Access denied") || 
            error.message.includes("Article not found") || 
            error.message.includes("Paywall detected") ||
            error.message.includes("Cannot access URL")) {
          throw error;
        }
      }
      
      // Last attempt failed, try next user agent
      lastError = error instanceof Error ? error : new Error("Unknown error");
      if (attempt < USER_AGENTS.length - 1) {
        console.log(`Attempt ${attempt + 1} failed, trying next user agent...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
    }
  }
  
  // All attempts failed
  throw lastError || new Error("Failed to fetch article content after multiple attempts");
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

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format. Please enter a valid URL (e.g., https://example.com/article)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: "Only HTTP and HTTPS URLs are supported" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Extracting article from:", url);
    const extractedText = await extractArticle(url);
    const cleanedText = cleanText(extractedText);

    if (!cleanedText || cleanedText.length < 50) {
      return new Response(
        JSON.stringify({ error: "Could not extract enough article content. The page may be empty, behind a login, or use JavaScript rendering. Try a different article URL." }),
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
      body: JSON.stringify({ 
        text: cleanedText,
        sourceUrl: url 
      }),
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
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Client errors should return 400, not 500
    if (errorMessage.includes("Invalid URL") || 
        errorMessage.includes("timeout") || 
        errorMessage.includes("Could not find") ||
        errorMessage.includes("Connection failed") ||
        errorMessage.includes("Failed to extract") ||
        errorMessage.includes("Failed to fetch URL:")) {
      statusCode = 400;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
