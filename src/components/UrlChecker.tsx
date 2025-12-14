import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Link2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResultCard from "./ResultCard";
import UrlHistory from "./UrlHistory";
import TrendingArticles from "./TrendingArticles";
import UrlPreview from "./UrlPreview";

// Example working news URLs for testing (homepage/section pages with articles)
const EXAMPLE_URLS = [
  "https://lite.cnn.com/",
  "https://www.bbc.com/news",
  "https://text.npr.org/",
  "https://www.reuters.com/world/",
  "https://apnews.com/",
  "https://www.theguardian.com/international"
];

interface HistoryItem {
  url: string;
  timestamp: number;
  result?: string;
  confidence?: number;
}

interface UrlCheckerProps {
  initialUrl?: string | null;
}

const UrlChecker = ({ initialUrl }: UrlCheckerProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [extractedText, setExtractedText] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("urlHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse history:", error);
      }
    }
  }, []);

  // Handle initial URL from bookmarklet
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      // Auto-analyze after a short delay
      const timer = setTimeout(() => {
        handleAnalyze(initialUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialUrl]);

  // Save history to localStorage
  const saveToHistory = (url: string, result?: string, confidence?: number) => {
    const newItem: HistoryItem = {
      url,
      timestamp: Date.now(),
      result,
      confidence
    };
    const newHistory = [newItem, ...history.filter(item => item.url !== url)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem("urlHistory", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("urlHistory");
    toast({
      title: "History Cleared",
      description: "URL history has been cleared",
    });
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || url;
    
    if (!targetUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(targetUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com/article)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setExtractedText("");

    try {
      const { data, error } = await supabase.functions.invoke("extract-url", {
        body: { url: targetUrl },
      });

      if (error) {
        // Extract error message from the error object
        let errorMessage = "Failed to extract and predict URL";
        
        // Try to get the error from the response
        if (error.message) {
          // The error might contain the actual error in the message
          const errorMatch = error.message.match(/\{"error":"([^"]+)"\}/);
          if (errorMatch && errorMatch[1]) {
            errorMessage = errorMatch[1];
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      setResult(data.prediction);
      setExtractedText(data.extracted_text);
      saveToHistory(targetUrl, data.prediction?.label, data.prediction?.score);
      toast({
        title: "Prediction Complete",
        description: "Article extracted and predicted successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze URL. Please ensure the URL is valid and accessible.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTryExample = () => {
    const randomUrl = EXAMPLE_URLS[Math.floor(Math.random() * EXAMPLE_URLS.length)];
    setUrl(randomUrl);
    toast({
      title: "Example URL Loaded",
      description: "Click 'Predict URL' to analyze this news article",
    });
  };

  return (
    <div className="space-y-6">
      {/* Trending Articles */}
      <TrendingArticles onSelectUrl={setUrl} />

      {/* URL Input Card */}
      <div className="glass-card p-6 rounded-2xl space-y-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Enter Article URL
          </label>
          <Button
            onClick={handleTryExample}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Try Example
          </Button>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://lite.cnn.com/ or https://www.bbc.com/news"
              className="pl-10 bg-input/50 border-border focus:border-primary transition-colors"
            />
          </div>
          
          <Button
            onClick={() => handleAnalyze()}
            disabled={loading || !url.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-semibold px-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              "Predict URL"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Works best with free news sites (BBC, CNN, Reuters, AP News). Paywalled sites (NYTimes, WSJ) and sites blocking bots won't work. Use homepage or section URLs for best results.
        </p>
      </div>

      {/* URL Preview */}
      {url && <UrlPreview url={url} />}

      {/* URL History */}
      <UrlHistory 
        history={history} 
        onSelectUrl={setUrl}
        onClearHistory={clearHistory}
      />

      {extractedText && (
        <div className="glass-card p-6 rounded-2xl space-y-3 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="w-1 h-4 bg-accent rounded-full" />
            Extracted Article
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 max-h-[300px] overflow-y-auto">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {extractedText}
            </p>
          </div>
        </div>
      )}

      {result && <ResultCard result={result} />}
    </div>
  );
};

export default UrlChecker;
