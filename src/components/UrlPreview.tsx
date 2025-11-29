import { Globe, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UrlPreviewProps {
  url: string;
}

const UrlPreview = ({ url }: UrlPreviewProps) => {
  if (!url) return null;

  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url);
  } catch {
    return (
      <Card className="glass-card border-destructive/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Invalid URL</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please enter a valid URL starting with http:// or https://
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const domain = parsedUrl.hostname;
  const isSecure = parsedUrl.protocol === "https:";

  // Check if it's a known trusted domain
  const trustedDomains = [
    "bbc.com", "cnn.com", "reuters.com", "apnews.com", 
    "npr.org", "theguardian.com", "aljazeera.com", "dw.com"
  ];
  const isTrusted = trustedDomains.some(trusted => domain.includes(trusted));

  return (
    <Card className={`glass-card ${isTrusted ? "border-success/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Globe className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isTrusted ? "text-success" : "text-primary"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground truncate">{domain}</p>
              {isSecure && (
                <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mb-2">{url}</p>
            {isTrusted && (
              <div className="flex items-center gap-1">
                <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">
                  Verified Source
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UrlPreview;
