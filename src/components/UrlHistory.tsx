import { useState } from "react";
import { Clock, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import HistoryFilter, { FilterType } from "./HistoryFilter";
import ExportButton from "./ExportButton";
import { AnalysisRecord } from "@/lib/exportUtils";

interface HistoryItem {
  url: string;
  timestamp: number;
  result?: string;
  confidence?: number;
}

interface UrlHistoryProps {
  history: HistoryItem[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
}

const UrlHistory = ({ history, onSelectUrl, onClearHistory }: UrlHistoryProps) => {
  const [filter, setFilter] = useState<FilterType>('all');

  if (history.length === 0) {
    return null;
  }

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.result === filter);

  const exportRecords: AnalysisRecord[] = filteredHistory.map((item, index) => ({
    id: `url-${index}`,
    type: 'url' as const,
    input: item.url,
    result: (item.result as 'REAL' | 'FAKE') || 'UNKNOWN',
    confidence: item.confidence || 0,
    timestamp: item.timestamp,
  }));

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <CardTitle className="text-lg">URL History</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <HistoryFilter filter={filter} onFilterChange={setFilter} />
            <ExportButton records={exportRecords} title="URL Analysis History" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        <CardDescription>Recently analyzed URLs {filter !== 'all' && `(${filter} only)`}</CardDescription>
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
                  onClick={() => onSelectUrl(item.url)}
                >
                  <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{item.url}</p>
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
  );
};

export default UrlHistory;
