import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ResultCardProps {
  result: {
    label: string;
    score: number;
    text?: string;
    raw?: any[];
  };
}

const ResultCard = ({ result }: ResultCardProps) => {
  const [showRaw, setShowRaw] = useState(false);
  const isFake = result.label === "FAKE";
  const confidence = Math.round(result.score * 100);

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6 shadow-[var(--shadow-card)] animate-scale-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isFake ? (
            <div className="p-3 rounded-xl bg-destructive/20 glow-red">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-success/20">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-foreground">Analysis Result</h3>
            <p className="text-sm text-muted-foreground">AI-powered verification</p>
          </div>
        </div>

        <Badge
          variant={isFake ? "destructive" : "default"}
          className={`px-4 py-1.5 text-sm font-bold ${
            isFake ? "bg-destructive" : "bg-success"
          }`}
        >
          {result.label}
        </Badge>
      </div>

      {/* Confidence Score */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Confidence Score</span>
          <span className="text-2xl font-bold gradient-text">{confidence}%</span>
        </div>
        
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${isFake ? "bg-destructive" : "bg-success"}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          {confidence >= 80
            ? "High confidence in prediction"
            : confidence >= 60
            ? "Moderate confidence"
            : "Low confidence - manual verification recommended"}
        </p>
      </div>

      {/* Analyzed Text Preview */}
      {result.text && (
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            Analyzed Text
          </h4>
          <div className="bg-muted/30 rounded-lg p-3 max-h-[150px] overflow-y-auto">
            <p className="text-xs text-muted-foreground">
              {result.text.substring(0, 300)}
              {result.text.length > 300 && "..."}
            </p>
          </div>
        </div>
      )}

      {/* Raw Scores Toggle */}
      {result.raw && result.raw.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <Button
            onClick={() => setShowRaw(!showRaw)}
            variant="ghost"
            className="w-full justify-between hover:bg-muted/50"
          >
            <span className="text-sm font-medium">View Raw Scores</span>
            {showRaw ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {showRaw && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {result.raw.map((score: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                >
                  <span className="text-sm font-medium text-foreground">
                    {score.label}
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {(score.score * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
