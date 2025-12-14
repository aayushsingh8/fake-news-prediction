import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResultCard from "./ResultCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import HistoryFilter, { FilterType } from "./HistoryFilter";
import ExportButton from "./ExportButton";
import { AnalysisRecord } from "@/lib/exportUtils";

interface TextHistoryItem {
  text: string;
  timestamp: number;
  result?: string;
  confidence?: number;
}

const TextChecker = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<TextHistoryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("textHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse text history:", error);
      }
    }
  }, []);

  const saveToHistory = (text: string, result?: string, confidence?: number) => {
    const newItem: TextHistoryItem = {
      text: text.substring(0, 200),
      timestamp: Date.now(),
      result,
      confidence
    };
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem("textHistory", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("textHistory");
    toast({
      title: "History Cleared",
      description: "Text analysis history has been cleared",
    });
  };

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
      const { data, error } = await supabase.functions.invoke("ensemble-predict", {
        body: { text },
      });

      if (error) throw error;

      setResult(data);
      saveToHistory(text, data?.label, data?.score);
      toast({
        title: "Prediction Complete",
        description: "Your text has been predicted successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to predict text",
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

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.result === filter);

  const exportRecords: AnalysisRecord[] = filteredHistory.map((item, index) => ({
    id: `text-${index}`,
    type: 'text' as const,
    input: item.text,
    result: (item.result as 'REAL' | 'FAKE') || 'UNKNOWN',
    confidence: item.confidence || 0,
    timestamp: item.timestamp,
  }));

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
              "Predict Text"
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

      {/* Text History */}
      {history.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <CardTitle className="text-lg">Text History</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <HistoryFilter filter={filter} onFilterChange={setFilter} />
                <ExportButton records={exportRecords} title="Text Analysis History" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            <CardDescription>Recently analyzed texts {filter !== 'all' && `(${filter} only)`}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {filteredHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No {filter} results found
                  </p>
                ) : (
                  filteredHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => setText(item.text)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate">{item.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {item.result && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.result === "REAL"
                              ? "bg-success/20 text-success"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {item.result}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextChecker;
