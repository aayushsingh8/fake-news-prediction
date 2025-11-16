import { Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-md bg-card/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Truth Guard</h1>
              <p className="text-xs text-muted-foreground">AI-Powered News Prediction</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Model Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
