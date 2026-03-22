import { useState } from "react";
import { BarChart3, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StockAutocomplete from "@/components/StockAutocomplete";

interface SentimentSource {
  name: string;
  sentiment: string;
  score: number;
  highlights: string[];
}

interface SentimentData {
  ticker: string;
  overallSentiment: string;
  sentimentScore: number;
  sources: SentimentSource[];
  trendingTopics: string[];
  summary: string;
}

const Sentiment = () => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SentimentData | null>(null);

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const { data: result, error } = await supabase.functions.invoke("stock-sentiment", {
        body: { ticker: ticker.trim() },
      });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze sentiment");
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes("bull")) return "profit-text";
    if (lower.includes("bear")) return "loss-text";
    return "text-[hsl(var(--warning))]";
  };

  const scoreColor = (score: number) => {
    if (score >= 65) return "bg-[hsl(var(--profit))]";
    if (score >= 40) return "bg-[hsl(var(--warning))]";
    return "bg-[hsl(var(--loss))]";
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Market Sentiment Analysis</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Understand the market's mood and what's driving sentiment for specific stocks.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <StockAutocomplete
          value={ticker}
          onChange={setTicker}
          placeholder="Enter ticker (e.g., NVDA)"
          className="flex-1 bg-secondary/50 text-sm"
        />
        <Button type="submit" disabled={loading || !ticker.trim()} className="w-full sm:w-auto text-sm">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Analyze Sentiment
        </Button>
      </form>

      {loading && (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Analyzing sentiment for {ticker.toUpperCase()}...</p>
          </CardContent>
        </Card>
      )}

      {!loading && !data && (
        <Card className="bg-card border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 size={40} className="text-muted-foreground/30 mb-4" />
            <CardTitle className="text-lg mb-2 text-muted-foreground">No sentiment data</CardTitle>
            <p className="text-sm text-muted-foreground/70">Enter a stock ticker to analyze market sentiment across news, social media, and analyst reports.</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-bold">{data.ticker}</h3>
                  <p className={`text-lg font-semibold ${sentimentColor(data.overallSentiment)}`}>
                    {data.overallSentiment}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-mono font-bold">{data.sentimentScore}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${scoreColor(data.sentimentScore)}`} style={{ width: `${data.sentimentScore}%` }} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">{data.summary}</p>
            </CardContent>
          </Card>

          {/* Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.sources.map((source, i) => (
              <Card key={i} className="bg-card border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${sentimentColor(source.sentiment)}`}>{source.sentiment}</span>
                      <span className="font-mono text-xs text-muted-foreground">{source.score}/100</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mb-3">
                    <div className={`h-full rounded-full ${scoreColor(source.score)}`} style={{ width: `${source.score}%` }} />
                  </div>
                  <div className="space-y-1">
                    {source.highlights.map((h, j) => (
                      <p key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {h}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trending Topics */}
          {data.trendingTopics && data.trendingTopics.length > 0 && (
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.trendingTopics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="bg-secondary/30">{topic}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Sentiment;
