import { useState } from "react";
import { Newspaper, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StockAutocomplete from "@/components/StockAutocomplete";

interface Article {
  title: string;
  source: string;
  timeAgo: string;
  summary: string;
  sentiment: string;
  impact: string;
}

interface NewsData {
  topic: string;
  summary: string;
  articles: Article[];
  overallSentiment: string;
  keyTakeaway: string;
}

const defaultNews: Article[] = [
  { title: "NVIDIA Surpasses Expectations with Record Q4 Earnings", source: "Bloomberg", timeAgo: "2h ago", summary: "NVIDIA reported record revenue of $22.1B, driven by surging demand for AI chips. Data center revenue grew 409% year-over-year.", sentiment: "positive", impact: "high" },
  { title: "Federal Reserve Signals Potential Rate Cuts in 2026", source: "Reuters", timeAgo: "3h ago", summary: "Fed Chair indicated the central bank could begin reducing interest rates if inflation continues its downward trajectory.", sentiment: "positive", impact: "high" },
  { title: "Apple Announces Major AI Integration Across Product Line", source: "CNBC", timeAgo: "4h ago", summary: "Apple unveiled plans to embed generative AI features into iOS, macOS, and all hardware products starting this fall.", sentiment: "positive", impact: "medium" },
  { title: "Tesla Stock Dips Amid Production Delays in Berlin", source: "MarketWatch", timeAgo: "5h ago", summary: "Tesla shares fell 3% after reports of production slowdowns at the Berlin Gigafactory due to supply chain constraints.", sentiment: "negative", impact: "medium" },
  { title: "S&P 500 Reaches New All-Time High on Tech Rally", source: "Financial Times", timeAgo: "6h ago", summary: "The S&P 500 closed at a record high, buoyed by strong performances in the technology and semiconductor sectors.", sentiment: "positive", impact: "medium" },
  { title: "Microsoft Azure Revenue Grows 30% as Cloud Demand Surges", source: "WSJ", timeAgo: "7h ago", summary: "Microsoft's cloud division continues to gain market share, with Azure revenue rising 30% in the latest quarter.", sentiment: "positive", impact: "medium" },
  { title: "Oil Prices Drop on Rising US Inventory Data", source: "Bloomberg", timeAgo: "8h ago", summary: "Crude oil prices declined 2% as the EIA reported a larger-than-expected buildup in US crude stockpiles.", sentiment: "negative", impact: "low" },
  { title: "Amazon Expands Same-Day Delivery to 15 New Markets", source: "TechCrunch", timeAgo: "9h ago", summary: "Amazon announced expansion of its same-day delivery service, intensifying competition in the logistics space.", sentiment: "positive", impact: "low" },
];

const News = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsData | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setNews(null);
    try {
      const { data, error } = await supabase.functions.invoke("stock-news", {
        body: { query: query.trim() },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setNews(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  const sentimentIcon = (s: string) => {
    if (s === "positive") return <TrendingUp size={14} className="profit-text" />;
    if (s === "negative") return <TrendingDown size={14} className="loss-text" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  const impactBadge = (impact: string) => {
    const colors: Record<string, string> = {
      high: "bg-[hsl(var(--loss))]/10 text-[hsl(var(--loss))] border-[hsl(var(--loss))]/30",
      medium: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
      low: "bg-secondary/50 text-muted-foreground border-border/50",
    };
    return colors[impact] || colors.low;
  };

  const renderArticles = (articles: Article[]) => (
    <div className="space-y-3">
      {articles.map((article, i) => (
        <Card key={i} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {sentimentIcon(article.sentiment)}
                  <h4 className="text-sm font-semibold">{article.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{article.summary}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">{article.source}</span>
                  <span className="text-xs text-muted-foreground/50">·</span>
                  <span className="text-xs text-muted-foreground">{article.timeAgo}</span>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs shrink-0 ${impactBadge(article.impact)}`}>
                {article.impact}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Synthesized News</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          AI-summarized news for any company or theme — stay ahead with quick, actionable insights.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <StockAutocomplete
          value={query}
          onChange={setQuery}
          placeholder="Search company or topic"
          className="flex-1 bg-secondary/50 text-sm"
        />
        <Button type="submit" disabled={loading || !query.trim()} className="w-full sm:w-auto text-sm">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Get News
        </Button>
      </form>

      {loading && (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Synthesizing news for "{query}"...</p>
          </CardContent>
        </Card>
      )}

      {!loading && news && (
        <div className="space-y-4">
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-bold">{news.topic}</h3>
                <Badge variant="outline" className="capitalize">{news.overallSentiment}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{news.summary}</p>
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm"><span className="font-semibold text-primary">Key Takeaway:</span> {news.keyTakeaway}</p>
              </div>
            </CardContent>
          </Card>
          {renderArticles(news.articles)}
        </div>
      )}

      {!loading && !news && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-primary" />
            <h3 className="font-display text-base font-semibold">Trending Market News</h3>
          </div>
          {renderArticles(defaultNews)}
        </div>
      )}
    </div>
  );
};

export default News;
