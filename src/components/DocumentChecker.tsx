import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResultCard from "./ResultCard";

const DocumentChecker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

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
        toast({
          title: "Analysis Complete",
          description: "Your document has been analyzed successfully",
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
        title: "Analysis Failed",
        description: error.message || "Failed to analyze document",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
  };

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
              Analyzing Document...
            </>
          ) : (
            "Analyze Document"
          )}
        </Button>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
};

export default DocumentChecker;
