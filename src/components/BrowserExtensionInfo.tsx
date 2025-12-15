import { ExternalLink, Chrome, Puzzle, Download, FolderOpen, FileCode, FileImage } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const extensionFiles = [
  { name: "manifest.json", type: "config" },
  { name: "popup.html", type: "html" },
  { name: "popup.js", type: "script" },
  { name: "content.js", type: "script" },
  { name: "content.css", type: "style" },
  { name: "icon16.png", type: "icon" },
  { name: "icon48.png", type: "icon" },
  { name: "icon128.png", type: "icon" },
];

const BrowserExtensionInfo = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-primary" />
          <CardTitle>Browser Extension</CardTitle>
        </div>
        <CardDescription>
          Analyze news articles directly on any webpage without leaving the page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chrome Extension */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Chrome className="w-5 h-5 text-accent" />
            <h4 className="font-medium">Chrome Extension Files</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Download all the files below and save them to a single folder on your computer.
          </p>
          
          {/* Download Links */}
          <div className="grid grid-cols-2 gap-2">
            {extensionFiles.map((file) => (
              <a
                key={file.name}
                href={`/extension/${file.name}`}
                download={file.name}
                className="flex items-center gap-2 p-2 rounded-md bg-background/50 border border-border hover:bg-accent/10 transition-colors text-sm"
              >
                {file.type === "icon" ? (
                  <FileImage className="w-4 h-4 text-accent" />
                ) : (
                  <FileCode className="w-4 h-4 text-primary" />
                )}
                <span className="truncate">{file.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Installation Steps:</h4>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
            <li>Create a new folder called <code className="px-1 py-0.5 bg-muted rounded text-xs">truth-guard-extension</code></li>
            <li>Download all 8 files above into that folder</li>
            <li>Open Chrome and go to <code className="px-1 py-0.5 bg-muted rounded text-xs">chrome://extensions</code></li>
            <li>Enable <strong>"Developer mode"</strong> in the top right corner</li>
            <li>Click <strong>"Load unpacked"</strong> and select your folder</li>
            <li>The Truth Guard icon will appear in your toolbar</li>
          </ol>
        </div>

        {/* How to Use */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-accent" />
            <h4 className="font-medium text-sm">How to Use</h4>
          </div>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
            <li>Visit any news article you want to verify</li>
            <li>Click the Truth Guard icon in your toolbar</li>
            <li>Click "Analyze This Page"</li>
            <li>Results will appear as an overlay on the page!</li>
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
