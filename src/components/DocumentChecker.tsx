import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, X, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResultCard from "./ResultCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import HistoryFilter, { FilterType } from "./HistoryFilter";
import ExportButton from "./ExportButton";
import { AnalysisRecord } from "@/lib/exportUtils";

interface DocHistoryItem {
  filename: string;
  timestamp: number;
  result?: string;
  confidence?: number;
}

const DocumentChecker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<DocHistoryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("docHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse doc history:", error);
      }
    }
  }, []);

  const saveToHistory = (filename: string, result?: string, confidence?: number) => {
    const newItem: DocHistoryItem = {
      filename,
      timestamp: Date.now(),
      result,
      confidence
    };
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem("docHistory", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("docHistory");
    toast({
      title: "History Cleared",
      description: "Document history has been cleared",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, TXT, DOC, or DOCX file",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke("analyze-document", {
          body: { 
            file: base64,
            filename: file.name,
            mimeType: file.type,
          },
        });

        if (error) throw error;

        setResult(data);
        saveToHistory(file.name, data?.label, data?.score);
        toast({
          title: "Prediction Complete",
          description: "Your document has been predicted successfully",
        });
        setLoading(false);
      };

      reader.onerror = () => {
        throw new Error("Failed to read file");
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to predict document",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.result === filter);

  const exportRecords: AnalysisRecord[] = filteredHistory.map((item, index) => ({
    id: `doc-${index}`,
    type: 'document' as const,
    input: item.filename,
    result: (item.result as 'REAL' | 'FAKE') || 'UNKNOWN',
    confidence: item.confidence || 0,
    timestamp: item.timestamp,
  }));

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl space-y-4 shadow-[var(--shadow-card)]">
        <label className="text-sm font-medium text-foreground">
          Upload Document
        </label>

        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-muted/20 group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, TXT, DOC, or DOCX (MAX. 10MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Predicting...
            </>
          ) : (
            "Predict Document"
          )}
        </Button>
      </div>

      {result && <ResultCard result={result} />}

      {/* Document History */}
      {history.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <CardTitle className="text-lg">Document History</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <HistoryFilter filter={filter} onFilterChange={setFilter} />
                <ExportButton records={exportRecords} title="Document Analysis History" />
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
            <CardDescription>Recently analyzed documents {filter !== 'all' && `(${filter} only)`}</CardDescription>
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
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 transition-colors"
                    >
                      <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate">{item.filename}</p>
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

export default DocumentChecker;
