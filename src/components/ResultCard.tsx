import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ResultCardProps {
  result: {
    label: string;
    score: number;
    text?: string;
    explanation?: string;
    ensemble?: {
      label: string;
      confidence: number;
      explanation: string;
      models: {
        bert?: any;
        ai?: any;
      };
      weights?: {
        bert: number;
        ai: number;
      };
    };
    raw?: any;
  };
}

const ResultCard = ({ result }: ResultCardProps) => {
  const [showModels, setShowModels] = useState(false);
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
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Ensemble ML + AI prediction
            </p>
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

      {/* AI Explanation */}
      {result.explanation && (
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            AI Analysis
          </h4>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-foreground/90">
              {result.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Model Breakdown */}
      {result.ensemble?.models && (
        <div className="pt-4 border-t border-border/50">
          <Button
            onClick={() => setShowModels(!showModels)}
            variant="ghost"
            className="w-full justify-between hover:bg-muted/50"
          >
            <span className="text-sm font-medium">View Model Predictions</span>
            {showModels ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {showModels && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {/* BERT Model */}
              {result.ensemble.models.bert && (
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        BERT ML Model
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Weight: {(result.ensemble.weights?.bert || 0) * 100}%
                      </span>
                    </div>
                    <Badge
                      variant={result.ensemble.models.bert.label === "FAKE" ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {result.ensemble.models.bert.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.round(result.ensemble.models.bert.score * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {Math.round(result.ensemble.models.bert.score * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Lovable AI Model */}
              {result.ensemble.models.ai && (
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Gemini AI
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Weight: {(result.ensemble.weights?.ai || 0) * 100}%
                      </span>
                    </div>
                    <Badge
                      variant={result.ensemble.models.ai.label === "FAKE" ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {result.ensemble.models.ai.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${Math.round(result.ensemble.models.ai.score * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {Math.round(result.ensemble.models.ai.score * 100)}%
                    </span>
                  </div>
                  {result.ensemble.models.ai.reasoning && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{result.ensemble.models.ai.reasoning}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* Raw Data Toggle */}
      {result.raw && (
        <div className="pt-4 border-t border-border/50">
          <Button
            onClick={() => setShowRaw(!showRaw)}
            variant="ghost"
            className="w-full justify-between hover:bg-muted/50"
          >
            <span className="text-sm font-medium">View Raw Response</span>
            {showRaw ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {showRaw && (
            <div className="mt-3 bg-muted/30 rounded-lg p-3 max-h-[200px] overflow-y-auto animate-fade-in">
              <pre className="text-xs text-muted-foreground font-mono">
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
