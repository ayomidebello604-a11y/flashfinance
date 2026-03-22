import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Target, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StockAutocomplete from "@/components/StockAutocomplete";

interface ResearchReport {
  company: string;
  ticker: string;
  sector: string;
  price?: string;
  marketCap?: string;
  peRatio?: string;
  summary: string;
  strengths: string[];
  risks: string[];
  catalysts?: string[];
  analystConsensus?: string;
  priceTarget?: string;
  outlook: string;
}

const StockResearch = () => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setReport(null);
    try {
      const { data, error } = await supabase.functions.invoke("stock-research", {
        body: { ticker: ticker.trim() },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze stock");
    } finally {
      setLoading(false);
    }
  };

  const consensusColor = (c?: string) => {
    if (!c) return "text-muted-foreground";
    const lower = c.toLowerCase();
    if (lower.includes("buy")) return "profit-text";
    if (lower.includes("sell")) return "loss-text";
    return "text-warning";
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">AI Stock Research</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Get a comprehensive picture of any stock — synthesized from multiple web sources with future projections.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <StockAutocomplete
            value={ticker}
            onChange={setTicker}
            placeholder="Enter stock ticker (e.g., AAPL)"
            className="pl-10 bg-secondary/50 text-sm"
          />
        </div>
        <Button type="submit" disabled={loading || !ticker.trim()} className="w-full sm:w-auto text-sm">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Analyze
        </Button>
      </form>

      {loading && (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Analyzing {ticker.toUpperCase()}...</p>
          </CardContent>
        </Card>
      )}

      {!loading && !report && (
        <Card className="bg-card border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={40} className="text-muted-foreground/30 mb-4" />
            <CardTitle className="text-lg mb-2 text-muted-foreground">Enter a stock ticker to begin</CardTitle>
            <p className="text-sm text-muted-foreground/70 max-w-md">
              Our AI will aggregate data from financial reports, news, analyst ratings, and social sentiment.
            </p>
          </CardContent>
        </Card>
      )}

      {report && (
        <div className="space-y-4">
          {/* Header */}
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-bold">{report.company}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline" className="font-mono">{report.ticker}</Badge>
                    <span className="text-sm text-muted-foreground">{report.sector}</span>
                  </div>
                </div>
                <div className="text-right">
                  {report.price && <p className="font-mono text-lg font-bold">{report.price}</p>}
                  {report.analystConsensus && (
                    <p className={`text-sm font-semibold ${consensusColor(report.analystConsensus)}`}>
                      {report.analystConsensus} · PT: {report.priceTarget}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                {report.marketCap && <span>Market Cap: <span className="font-mono text-foreground">{report.marketCap}</span></span>}
                {report.peRatio && <span>P/E: <span className="font-mono text-foreground">{report.peRatio}</span></span>}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp size={14} className="profit-text" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--profit))] mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risks */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield size={14} className="loss-text" /> Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--loss))] mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Catalysts */}
          {report.catalysts && report.catalysts.length > 0 && (
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target size={14} className="text-[hsl(var(--info))]" /> Catalysts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.catalysts.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--info))] mt-1.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Outlook */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Forward Outlook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.outlook}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StockResearch;
