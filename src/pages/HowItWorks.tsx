import Header from "@/components/Header";
import { ArrowRight, Database, Layers, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
              How It Works
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our advanced ML ensemble system combines multiple models to accurately predict fake news
            </p>
          </div>

          <div className="space-y-8 animate-fade-in">
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Step 1: Data Collection</h3>
                  <p className="text-muted-foreground mb-4">
                    We've trained our models on extensive datasets including the ISOT Fake News Dataset from Kaggle 
                    and the FakeNewsCorpus from Zenodo. These datasets contain thousands of verified real and fake news articles.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span>40,000+ labeled news articles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span>Diverse sources and topics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span>Balanced real and fake news samples</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Step 2: ML Model Training</h3>
                  <p className="text-muted-foreground mb-4">
                    We employ a sophisticated ensemble of four ML models, each bringing unique strengths:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">DistilBERT</h4>
                      <p className="text-sm text-muted-foreground">
                        Transformer-based model for deep contextual understanding of text
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">XGBoost</h4>
                      <p className="text-sm text-muted-foreground">
                        Gradient boosting for pattern recognition in news features
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">TF-IDF</h4>
                      <p className="text-sm text-muted-foreground">
                        Statistical analysis of word importance and frequency
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Ensemble Model</h4>
                      <p className="text-sm text-muted-foreground">
                        Weighted combination of all models (20% BERT + 80% advanced ML)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Step 3: Prediction Process</h3>
                  <p className="text-muted-foreground mb-4">
                    When you submit content, our system processes it through multiple stages:
                  </p>
                  <ol className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">1</span>
                      <span><strong>Text Preprocessing:</strong> Cleaning, normalization, and feature extraction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">2</span>
                      <span><strong>Source Verification:</strong> Checking credibility of news sources</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">3</span>
                      <span><strong>Model Analysis:</strong> Running all ML models in parallel</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">4</span>
                      <span><strong>Ensemble Voting:</strong> Combining predictions with weighted confidence</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">5</span>
                      <span><strong>Final Result:</strong> Delivering prediction with confidence score and reasoning</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HowItWorks;
