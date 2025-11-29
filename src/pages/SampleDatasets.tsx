import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, FileDown, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SampleDatasets = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Sample text copied to clipboard",
    });
  };

  const textSamples = {
    real: [
      {
        title: "Climate Report 2024",
        text: "The World Meteorological Organization released its annual climate report today, showing that 2024 is on track to be one of the warmest years on record. The report, compiled from data collected by meteorological agencies worldwide, indicates average global temperatures are 1.45°C above pre-industrial levels."
      },
      {
        title: "Tech Company Earnings",
        text: "Apple Inc. reported quarterly earnings that exceeded Wall Street expectations, with revenue of $89.5 billion. The company's CEO Tim Cook stated during the earnings call that strong iPhone sales in emerging markets contributed significantly to the growth."
      },
      {
        title: "Medical Research Breakthrough",
        text: "Researchers at Johns Hopkins University published findings in Nature Medicine showing promising results for a new Alzheimer's treatment. The peer-reviewed study involved 500 participants over 18 months, demonstrating a 30% reduction in cognitive decline compared to placebo."
      },
      {
        title: "Sports Championship",
        text: "The Golden State Warriors defeated the Boston Celtics 107-103 in Game 6 of the NBA Finals, securing their fifth championship in nine years. Stephen Curry was named Finals MVP after averaging 31 points throughout the series."
      },
      {
        title: "Economic Policy Update",
        text: "The Federal Reserve announced it would maintain interest rates at current levels following its two-day policy meeting. Fed Chair Jerome Powell cited stabilizing inflation and steady employment as key factors in the decision, which was anticipated by most economists."
      }
    ],
    fake: [
      {
        title: "Miracle Cure Discovery",
        text: "BREAKING: Scientists have discovered a miracle plant in the Amazon that cures all types of cancer within 24 hours! Big Pharma is trying to hide this from you! Share before they delete this!"
      },
      {
        title: "Celebrity Scandal",
        text: "SHOCKING: Famous actor secretly controls world government! Anonymous insider reveals the truth that mainstream media won't tell you. They've been manipulating elections for 20 years!"
      },
      {
        title: "Technology Hoax",
        text: "WARNING: Your smartphone is spying on you 24/7 and sending your thoughts to government databases! Delete all apps immediately and throw away your phone! This is not a joke!"
      },
      {
        title: "Financial Scheme",
        text: "Billionaire reveals secret method to make $10,000 per day from home with just 5 minutes of work! Banks hate this one simple trick! Click here before they shut this down!"
      },
      {
        title: "Health Misinformation",
        text: "URGENT: Doctors confirm that drinking bleach prevents all diseases! Medical establishment hiding this cure for decades! Try it now before government makes it illegal!"
      }
    ]
  };

  const urlSamples = {
    real: [
      "https://www.bbc.com/news/articles/c20gx2z3ynzo",
      "https://www.reuters.com/technology/",
      "https://www.theguardian.com/world",
      "https://apnews.com/hub/technology",
      "https://www.npr.org/sections/news/"
    ],
    fake: [
      "https://fake-news-site.com/shocking-celebrity-secret",
      "https://conspiracy-today.net/government-coverup-exposed",
      "https://miracle-cures-daily.com/cancer-cure-hidden",
      "https://viral-hoax.info/aliens-confirmed-by-nasa",
      "https://clickbait-news.net/you-wont-believe-what-happened"
    ]
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
              Sample Datasets
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Test our ML models with these sample datasets of real and fake news
            </p>
          </div>

          <div className="space-y-12 animate-fade-in">
            {/* Text Samples */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Text Data Samples</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-success/50">
                  <CardHeader>
                    <CardTitle className="text-success">Real News Examples</CardTitle>
                    <CardDescription>Authentic news from verified sources</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {textSamples.real.map((sample, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{sample.title}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(sample.text)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">{sample.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Fake News Examples</CardTitle>
                    <CardDescription>Misinformation and fabricated content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {textSamples.fake.map((sample, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{sample.title}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(sample.text)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">{sample.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* URL Samples */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">URL Data Samples</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-success/50">
                  <CardHeader>
                    <CardTitle className="text-success">Real News URLs</CardTitle>
                    <CardDescription>Links from reputable news organizations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {urlSamples.real.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground truncate flex-1">{url}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Fake News URLs</CardTitle>
                    <CardDescription>Links from unreliable sources (examples)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {urlSamples.fake.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground truncate flex-1">{url}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Document Samples */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent glow-purple">
                  <FileDown className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Document Samples</h2>
              </div>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Document Files for Testing</CardTitle>
                  <CardDescription>
                    Create your own test documents using the text samples above
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2 text-success">Real News Documents</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Copy any of the real news text samples above into a .txt, .doc, or .docx file 
                        and upload it to the Document Checker to verify it's predicted as REAL.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Suggested filenames: climate_report.txt, tech_earnings.docx, medical_research.doc
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2 text-destructive">Fake News Documents</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Copy any of the fake news text samples above into a .txt, .doc, or .docx file 
                        and upload it to the Document Checker to verify it's predicted as FAKE.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Suggested filenames: miracle_cure.txt, celebrity_hoax.docx, tech_scam.doc
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm">
                        <strong>Testing Tip:</strong> Our ML models support PDF, TXT, DOC, and DOCX formats 
                        up to 5MB. For best results, use documents with at least 100 words of content.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default SampleDatasets;
