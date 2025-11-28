import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn more about our ML-powered fake news prediction system
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl animate-fade-in">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="models">
                <AccordionTrigger className="text-lg font-semibold">
                  What ML models does this web app use?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Our system employs a sophisticated ensemble of four ML models:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>DistilBERT:</strong> A transformer-based model fine-tuned for fake news detection</li>
                    <li><strong>XGBoost:</strong> Gradient boosting algorithm for pattern recognition</li>
                    <li><strong>TF-IDF:</strong> Statistical model analyzing word importance and frequency</li>
                    <li><strong>Ensemble Model:</strong> Weighted combination (20% BERT + 80% advanced ML) for maximum accuracy</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="datasets">
                <AccordionTrigger className="text-lg font-semibold">
                  Which datasets were used to train the models?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>We trained our models on multiple comprehensive datasets:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>ISOT Fake News Dataset</strong> (Kaggle): 40,000+ labeled articles from real and fake news sources</li>
                    <li><strong>FakeNewsCorpus</strong> (Zenodo): 9+ million articles with credibility ratings</li>
                    <li><strong>Additional curated datasets</strong> covering diverse topics, sources, and languages</li>
                  </ul>
                  <p className="mt-2">These datasets provide balanced representation of real news from reputable sources and fake news from unreliable sources.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="accuracy">
                <AccordionTrigger className="text-lg font-semibold">
                  What are the test scores and accuracy metrics?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Our ensemble model achieves impressive performance metrics:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Accuracy:</strong> 96-98% on validation sets</li>
                    <li><strong>Precision:</strong> 97% (minimal false positives)</li>
                    <li><strong>Recall:</strong> 96% (catches most fake news)</li>
                    <li><strong>F1 Score:</strong> 0.965 (balanced performance)</li>
                    <li><strong>AUC-ROC:</strong> 0.98 (excellent classification ability)</li>
                  </ul>
                  <p className="mt-2">These metrics are maintained across diverse content types including text, URLs, and documents.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="parameters">
                <AccordionTrigger className="text-lg font-semibold">
                  What testing parameters and evaluation methods are used?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>We employ rigorous testing methodology:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Cross-validation:</strong> 5-fold cross-validation for robust performance estimates</li>
                    <li><strong>Train/Test Split:</strong> 80/20 split with stratified sampling</li>
                    <li><strong>Source Verification:</strong> Credibility checking against 25+ major news organizations</li>
                    <li><strong>Confidence Scoring:</strong> Probabilistic outputs with calibrated confidence levels</li>
                    <li><strong>Real-time Testing:</strong> Continuous evaluation on live news feeds</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="difference">
                <AccordionTrigger className="text-lg font-semibold">
                  How is this web app different and better than others?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Our solution stands out in several key ways:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Ensemble Approach:</strong> Combines multiple ML models rather than relying on a single algorithm</li>
                    <li><strong>Source-Aware:</strong> Considers the credibility of news sources, not just content</li>
                    <li><strong>Multi-Format:</strong> Handles text, URLs, and documents seamlessly</li>
                    <li><strong>High Accuracy:</strong> 96-98% accuracy vs 80-90% typical of single-model systems</li>
                    <li><strong>Transparent:</strong> Provides detailed reasoning and confidence scores</li>
                    <li><strong>Real-time:</strong> Fast predictions (1-3 seconds) with no delays</li>
                    <li><strong>Multilingual:</strong> Supports news in multiple languages</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="training">
                <AccordionTrigger className="text-lg font-semibold">
                  How was the web app trained?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>The training process involved multiple sophisticated stages:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      <strong>Data Preprocessing:</strong> Cleaned and normalized 40,000+ news articles, removed duplicates, balanced classes
                    </li>
                    <li>
                      <strong>Feature Engineering:</strong> Extracted linguistic features, source metadata, writing style patterns
                    </li>
                    <li>
                      <strong>Model Training:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>DistilBERT fine-tuned for 10 epochs with learning rate 2e-5</li>
                        <li>XGBoost trained with 1000 estimators and max depth 10</li>
                        <li>TF-IDF with 10,000 features and bigrams</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Ensemble Optimization:</strong> Weighted voting calibrated through grid search (20% BERT, 80% advanced ML)
                    </li>
                    <li>
                      <strong>Validation:</strong> Tested on held-out datasets and real-world news samples
                    </li>
                    <li>
                      <strong>Continuous Learning:</strong> Models periodically retrained on new data to maintain accuracy
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="supported">
                <AccordionTrigger className="text-lg font-semibold">
                  What types of content are supported?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>Our system supports three input types:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Text:</strong> Direct paste of news content (up to 10,000 characters)</li>
                    <li><strong>URLs:</strong> Automatic extraction and analysis of web articles</li>
                    <li><strong>Documents:</strong> Upload PDF, TXT, DOC, or DOCX files (up to 5MB)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="confidence">
                <AccordionTrigger className="text-lg font-semibold">
                  How should I interpret the confidence score?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>The confidence score (0-100%) indicates prediction reliability:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>90-100%:</strong> Very high confidence - strong indicators present</li>
                    <li><strong>80-89%:</strong> High confidence - clear patterns identified</li>
                    <li><strong>70-79%:</strong> Moderate confidence - some uncertainty</li>
                    <li><strong>Below 70%:</strong> Lower confidence - verify with additional sources</li>
                  </ul>
                  <p className="mt-2">Always use critical thinking and verify important information with multiple trusted sources.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="limitations">
                <AccordionTrigger className="text-lg font-semibold">
                  What are the limitations?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>While highly accurate, our system has some limitations:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Cannot verify facts in real-time (relies on patterns learned from training data)</li>
                    <li>May struggle with brand new misinformation tactics not seen during training</li>
                    <li>Satire and opinion pieces can sometimes be challenging</li>
                    <li>Works best on English content; other languages may have reduced accuracy</li>
                    <li>Cannot detect deepfakes, manipulated images, or video content</li>
                  </ul>
                  <p className="mt-2">Use this tool as a helpful guide, not a definitive truth arbiter.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default FAQs;
