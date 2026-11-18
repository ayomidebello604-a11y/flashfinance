import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Target, Shield, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "#src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#src/components/ui/card";
import { Badge } from "#src/components/ui/badge";
import { Alert, AlertDescription } from "#src/components/ui/alert";
import { requestAi } from "#src/lib/ai";
import { fetchMarketQuote } from "#src/lib/api";
import type { IndexPrice } from "#src/lib/market-types";
import StockAutocomplete from "#src/components/StockAutocomplete";

interface ResearchReport {
  company: string;
  ticker: string;
  sector: string;
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

interface ResearchData {
  report: ResearchReport;
  quote: IndexPrice | null;
  quoteError: string | null;
}

const StockResearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeTicker = searchParams.get("stock") || "";
  const [ticker, setTicker] = useState("");
  const [submittedTicker, setSubmittedTicker] = useState("");
  const activeTicker = routeTicker || submittedTicker;
  const {
    data,
    isFetching: loading,
    error: requestError,
    refetch,
  } = useQuery({
    queryKey: ["stock-research", activeTicker],
    enabled: Boolean(activeTicker),
    queryFn: async (): Promise<ResearchData> => {
      const [researchResult, quoteResult] = await Promise.allSettled([
        requestAi<ResearchReport>("research", { ticker: activeTicker }),
        fetchMarketQuote(activeTicker),
      ]);
      if (researchResult.status === "rejected") throw researchResult.reason;
      return {
        report: researchResult.value,
        quote: quoteResult.status === "fulfilled" ? quoteResult.value : null,
        quoteError: quoteResult.status === "rejected"
          ? quoteResult.reason instanceof Error ? quoteResult.reason.message : "The quote request failed."
          : null,
      };
    },
  });
  const report = data?.report ?? null;
  const quote = data?.quote ?? null;
  const quoteError = data?.quoteError ?? null;

  const handleAnalyze = () => {
    const symbol = (routeTicker || ticker).trim().toUpperCase();
    if (!symbol) return;
    if (routeTicker) setSearchParams({});
    setTicker(symbol);
    if (symbol === activeTicker) void refetch();
    else setSubmittedTicker(symbol);
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
          Get educational AI analysis alongside a separate Finnhub quote. Provider quote timing depends on your plan.
        </p>
      </div>

      {requestError && (
        <Alert className="bg-[hsl(var(--loss))]/10 border-[hsl(var(--loss))]/30">
          <AlertDescription>
            {requestError instanceof Error ? requestError.message : "The research request failed."}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <StockAutocomplete
            value={routeTicker || ticker}
            onChange={(value) => {
              if (routeTicker) setSearchParams({});
              setTicker(value);
            }}
            placeholder="Enter stock ticker (e.g., AAPL)"
            className="pl-10 bg-secondary/50 text-sm"
          />
        </div>
        <Button type="submit" disabled={loading || !(routeTicker || ticker).trim()} className="w-full sm:w-auto text-sm">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Analyze
        </Button>
      </form>

      {loading && (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Analyzing {activeTicker.toUpperCase()}...</p>
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
                  {quote ? (
                    <>
                      <p className="font-mono text-lg font-bold">${quote.price.toFixed(2)}</p>
                      <p className={`text-xs font-mono ${quote.change >= 0 ? "profit-text" : "loss-text"}`}>
                        Finnhub quote · {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)} ({quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%)
                      </p>
                      {quote.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          As of {new Date(quote.timestamp * 1000).toLocaleTimeString()}
                        </p>
                      )}
                      {quoteError && <p className="text-xs text-muted-foreground mt-1">{quoteError}</p>}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Finnhub quote unavailable{quoteError ? `: ${quoteError}` : ""}
                    </p>
                  )}
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
