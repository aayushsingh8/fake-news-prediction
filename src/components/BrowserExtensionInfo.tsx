import { ExternalLink, Chrome, Puzzle, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const BrowserExtensionInfo = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const bookmarkletCode = `javascript:(function(){var url=window.location.href;window.open('${window.location.origin}?check='+encodeURIComponent(url),'_blank');})();`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Drag this to your bookmarks bar to use as a quick checker",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-primary" />
          <CardTitle>Browser Integration</CardTitle>
        </div>
        <CardDescription>
          Check URLs directly from any webpage using our bookmarklet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bookmarklet */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Chrome className="w-5 h-5 text-accent" />
            <h4 className="font-medium">Quick Check Bookmarklet</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Drag this button to your bookmarks bar, then click it on any webpage to instantly check the URL:
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={bookmarkletCode}
              className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium text-sm cursor-move"
              onClick={(e) => e.preventDefault()}
            >
              📰 Check This Page
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={copyBookmarklet}
              className="text-xs"
            >
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">How to Use:</h4>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
            <li>Drag the "Check This Page" button to your bookmarks bar</li>
            <li>Visit any news article you want to verify</li>
            <li>Click the bookmark to analyze the current page</li>
            <li>Results will open in a new tab</li>
          </ol>
        </div>

        {/* API Integration */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-accent" />
            <h4 className="font-medium text-sm">API Integration</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Developers can integrate our analyzer into their applications using our API endpoint. 
            Contact us for API access and documentation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrowserExtensionInfo;
