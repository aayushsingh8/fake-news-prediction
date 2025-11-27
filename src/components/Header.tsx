import { Shield, Home, Brain, HelpCircle, Database } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const Header = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-md bg-card/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Truth Guard</h1>
              <p className="text-xs text-muted-foreground">ML-Powered News Prediction</p>
            </div>
          </NavLink>
          
          <nav className="hidden md:flex items-center gap-1">
            <NavLink 
              to="/" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              activeClassName="text-foreground bg-muted"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </NavLink>
            <NavLink 
              to="/how-it-works" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              activeClassName="text-foreground bg-muted"
            >
              <Brain className="w-4 h-4 inline mr-2" />
              How It Works
            </NavLink>
            <NavLink 
              to="/faqs" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              activeClassName="text-foreground bg-muted"
            >
              <HelpCircle className="w-4 h-4 inline mr-2" />
              FAQs
            </NavLink>
            <NavLink 
              to="/sample-datasets" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              activeClassName="text-foreground bg-muted"
            >
              <Database className="w-4 h-4 inline mr-2" />
              Sample Datasets
            </NavLink>
          </nav>
          
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">ML Models Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
