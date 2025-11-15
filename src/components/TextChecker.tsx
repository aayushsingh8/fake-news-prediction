import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResultCard from "./ResultCard";

const TextChecker = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("predict-text", {
        body: { text },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Your text has been analyzed successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze text",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl space-y-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">
            Enter News Text
          </label>
          <span className="text-xs text-muted-foreground">
            {text.length} characters
          </span>
        </div>
        
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type the news article you want to verify..."
          className="min-h-[200px] bg-input/50 border-border focus:border-primary transition-colors resize-none"
        />

        <div className="flex gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Text"
            )}
          </Button>
          
          {text && (
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
};

export default TextChecker;
