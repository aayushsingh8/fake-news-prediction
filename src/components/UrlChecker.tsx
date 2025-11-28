import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResultCard from "./ResultCard";

const UrlChecker = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [extractedText, setExtractedText] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
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
        body: { url },
      });

      if (error) throw error;

      setResult(data.prediction);
      setExtractedText(data.extracted_text);
      toast({
        title: "Prediction Complete",
        description: "Article extracted and predicted successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      
      // Show user-friendly error messages
      let errorMessage = "Failed to extract and predict URL";
      
      if (error.message?.includes("Edge Function returned a non-2xx status code")) {
        errorMessage = "Could not access the URL. Please check if the URL is correct and accessible.";
      } else if (error.context?.body) {
        // Try to parse the error from the edge function response
        try {
          const errorBody = typeof error.context.body === 'string' 
            ? JSON.parse(error.context.body) 
            : error.context.body;
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Keep default message
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Prediction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl space-y-4 shadow-[var(--shadow-card)]">
        <label className="text-sm font-medium text-foreground">
          Enter Article URL
        </label>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/news-article"
              className="pl-10 bg-input/50 border-border focus:border-primary transition-colors"
            />
          </div>
          
          <Button
            onClick={handleAnalyze}
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
          We'll extract and predict the article content from the provided URL
        </p>
      </div>

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
