import { TrendingUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrendingArticle {
  title: string;
  url: string;
  source: string;
}

interface TrendingArticlesProps {
  onSelectUrl: (url: string) => void;
}

const TRENDING_ARTICLES: TrendingArticle[] = [
  {
    title: "Global News Updates",
    url: "https://www.bbc.com/news",
    source: "BBC News"
  },
  {
    title: "World Headlines",
    url: "https://www.reuters.com/world/",
    source: "Reuters"
  },
  {
    title: "Latest Stories",
    url: "https://lite.cnn.com/",
    source: "CNN"
  },
  {
    title: "Breaking News",
    url: "https://apnews.com/",
    source: "AP News"
  },
  {
    title: "Top Stories",
    url: "https://text.npr.org/",
    source: "NPR"
  },
  {
    title: "International News",
    url: "https://www.theguardian.com/international",
    source: "The Guardian"
  }
];

const TrendingArticles = ({ onSelectUrl }: TrendingArticlesProps) => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <CardTitle className="text-lg">Trending News Sources</CardTitle>
        </div>
        <CardDescription>Popular verified news sources to test</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {TRENDING_ARTICLES.map((article, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-between h-auto py-3"
              onClick={() => onSelectUrl(article.url)}
            >
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{article.title}</p>
                <p className="text-xs text-muted-foreground">{article.source}</p>
              </div>
              <ExternalLink className="w-3 h-3 ml-2 flex-shrink-0" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingArticles;
