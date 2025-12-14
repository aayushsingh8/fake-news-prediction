import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, X, GitCompare, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComparisonResult {
  url: string;
  result?: {
    label: string;
    score: number;
    explanation?: string;
  };
  loading: boolean;
  error?: string;
}

const ComparisonView = () => {
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, '']);
    }
  };

  const removeUrl = (index: number) => {
    if (urls.length > 2) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const analyzeAll = async () => {
    const validUrls = urls.filter(url => url.trim());
    if (validUrls.length < 2) {
      toast({
        title: "Error",
        description: "Please enter at least 2 URLs to compare",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResults(validUrls.map(url => ({ url, loading: true })));

    const promises = validUrls.map(async (url, index) => {
      try {
        const { data, error } = await supabase.functions.invoke("extract-url", {
          body: { url },
        });

        if (error) throw error;

        setResults(prev => {
          const newResults = [...prev];
          newResults[index] = {
            url,
            result: data.prediction,
            loading: false,
          };
          return newResults;
        });
      } catch (error: any) {
        setResults(prev => {
          const newResults = [...prev];
          newResults[index] = {
            url,
            loading: false,
            error: error.message || "Failed to analyze",
          };
          return newResults;
        });
      }
    });

    await Promise.all(promises);
    setAnalyzing(false);
    toast({
      title: "Comparison Complete",
      description: `Analyzed ${validUrls.length} URLs`,
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          <CardTitle>Compare Multiple URLs</CardTitle>
        </div>
        <CardDescription>
          Analyze up to 5 URLs side-by-side for comparison
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Inputs */}
        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder={`URL ${index + 1}`}
                  className="pl-10 bg-input/50"
                />
              </div>
              {urls.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrl(index)}
                  className="hover:bg-destructive/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {urls.length < 5 && (
            <Button variant="outline" size="sm" onClick={addUrl}>
              <Plus className="w-4 h-4 mr-1" />
              Add URL
            </Button>
          )}
          <Button
            onClick={analyzeAll}
            disabled={analyzing || urls.filter(u => u.trim()).length < 2}
            className="bg-gradient-to-r from-primary to-accent"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare All
              </>
            )}
          </Button>
        </div>

        {/* Comparison Results */}
        {results.length > 0 && (
          <ScrollArea className="h-[400px]">
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((item, index) => (
                <Card 
                  key={index} 
                  className={`border-2 ${
                    item.result?.label === 'REAL' 
                      ? 'border-success/50 bg-success/5' 
                      : item.result?.label === 'FAKE'
                      ? 'border-destructive/50 bg-destructive/5'
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground truncate">
                      {item.url}
                    </p>
                    
                    {item.loading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </div>
                    ) : item.error ? (
                      <p className="text-sm text-destructive">{item.error}</p>
                    ) : item.result ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={`text-2xl font-bold ${
                            item.result.label === 'REAL' 
                              ? 'text-success' 
                              : 'text-destructive'
                          }`}>
                            {item.result.label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {(item.result.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        {item.result.explanation && (
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {item.result.explanation}
                          </p>
                        )}
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonView;
