import { Shield, Home, Brain, HelpCircle, Database, Users, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
            <NavLink 
              to="/team" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              activeClassName="text-foreground bg-muted"
            >
              <Users className="w-4 h-4 inline mr-2" />
              Team
            </NavLink>
          </nav>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">ML Models Active</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <NavLink 
                to="/" 
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="text-foreground bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Home
              </NavLink>
              <NavLink 
                to="/how-it-works" 
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="text-foreground bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                How It Works
              </NavLink>
              <NavLink 
                to="/faqs" 
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="text-foreground bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4 inline mr-2" />
                FAQs
              </NavLink>
              <NavLink 
                to="/sample-datasets" 
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="text-foreground bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Database className="w-4 h-4 inline mr-2" />
                Sample Datasets
              </NavLink>
              <NavLink 
                to="/team" 
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="text-foreground bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Team
              </NavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
