import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TextChecker from "@/components/TextChecker";
import UrlChecker from "@/components/UrlChecker";
import DocumentChecker from "@/components/DocumentChecker";
import ComparisonView from "@/components/ComparisonView";
import BrowserExtensionInfo from "@/components/BrowserExtensionInfo";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("text");
  const [searchParams] = useSearchParams();
  const [initialUrl, setInitialUrl] = useState<string | null>(null);

  // Handle URL check from bookmarklet
  useEffect(() => {
    const checkUrl = searchParams.get('check');
    if (checkUrl) {
      setInitialUrl(checkUrl);
      setActiveTab('url');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
              Fake News Prediction
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by ML models to predict misinformation. Predict text, URLs, or documents instantly.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 glass-card p-1.5 h-auto">
              <TabsTrigger 
                value="text" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs md:text-sm"
              >
                Text Checker
              </TabsTrigger>
              <TabsTrigger 
                value="url"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs md:text-sm"
              >
                URL Predictor
              </TabsTrigger>
              <TabsTrigger 
                value="document"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs md:text-sm"
              >
                Document
              </TabsTrigger>
              <TabsTrigger 
                value="compare"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs md:text-sm"
              >
                Compare
              </TabsTrigger>
              <TabsTrigger 
                value="extension"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs md:text-sm"
              >
                Browser
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="animate-fade-in">
              <TextChecker />
            </TabsContent>

            <TabsContent value="url" className="animate-fade-in">
              <UrlChecker initialUrl={initialUrl} />
            </TabsContent>

            <TabsContent value="document" className="animate-fade-in">
              <DocumentChecker />
            </TabsContent>

            <TabsContent value="compare" className="animate-fade-in">
              <ComparisonView />
            </TabsContent>

            <TabsContent value="extension" className="animate-fade-in">
              <BrowserExtensionInfo />
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;
