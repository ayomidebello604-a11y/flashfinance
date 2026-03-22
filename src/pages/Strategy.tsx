import { useState } from "react";
import { TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StockAutocomplete from "@/components/StockAutocomplete";

interface TechnicalIndicator {
  name: string;
  value: string;
  interpretation: string;
}

interface Strategy {
  ticker: string;
  timeframe: string;
  signal: string;
  confidence: number;
  entryPrice?: string;
  targetPrice?: string;
  stopLoss?: string;
  rationale: string;
  technicalIndicators?: TechnicalIndicator[];
  keyLevels?: { support: string; resistance: string };
  riskReward?: string;
}

const Strategy = () => {
  const [ticker, setTicker] = useState("");
  const [activeTimeframe, setActiveTimeframe] = useState("intraday");
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<Record<string, Strategy>>({});

  const handleGenerate = async (timeframe?: string) => {
    if (!ticker.trim()) return;
    const tf = timeframe || activeTimeframe;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-strategy", {
        body: { ticker: ticker.trim(), timeframe: tf },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setStrategies((prev) => ({ ...prev, [tf]: data }));
    } catch (e: any) {
      toast.error(e.message || "Failed to generate strategy");
    } finally {
      setLoading(false);
    }
  };

  const signalColor = (signal?: string) => {
    if (!signal) return "";
    const s = signal.toUpperCase();
    if (s === "BUY") return "profit-text";
    if (s === "SELL") return "loss-text";
    return "text-[hsl(var(--warning))]";
  };

  const signalBg = (signal?: string) => {
    if (!signal) return "bg-muted";
    const s = signal.toUpperCase();
    if (s === "BUY") return "bg-[hsl(var(--profit))]/10 text-[hsl(var(--profit))] border-[hsl(var(--profit))]/30";
    if (s === "SELL") return "bg-[hsl(var(--loss))]/10 text-[hsl(var(--loss))] border-[hsl(var(--loss))]/30";
    return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30";
  };

  const renderStrategy = (tf: string) => {
    const strategy = strategies[tf];
    if (loading && activeTimeframe === tf) {
      return (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Generating {tf} strategy for {ticker.toUpperCase()}...</p>
          </CardContent>
        </Card>
      );
    }
    if (!strategy) {
      return (
        <Card className="bg-card border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp size={40} className="text-muted-foreground/30 mb-4" />
            <CardTitle className="text-lg mb-2 text-muted-foreground">No strategy generated yet</CardTitle>
            <p className="text-sm text-muted-foreground/70">Enter a ticker and click Generate Strategy.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {/* Signal Header */}
        <Card className="bg-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge className={`text-lg px-3 py-1 ${signalBg(strategy.signal)}`}>
                  {strategy.signal === "BUY" ? <ArrowUpRight size={16} className="mr-1" /> : strategy.signal === "SELL" ? <ArrowDownRight size={16} className="mr-1" /> : null}
                  {strategy.signal}
                </Badge>
                <span className="text-sm text-muted-foreground">Confidence: <span className="font-mono text-foreground">{strategy.confidence}%</span></span>
              </div>
              {strategy.riskReward && <span className="text-xs text-muted-foreground">Risk/Reward: <span className="font-mono text-foreground">{strategy.riskReward}</span></span>}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{strategy.rationale}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategy.entryPrice && (
            <div className="stat-card">
              <span className="text-xs text-muted-foreground">Entry Price</span>
              <p className="font-mono text-lg font-bold mt-1">{strategy.entryPrice}</p>
            </div>
          )}
          {strategy.targetPrice && (
            <div className="stat-card">
              <span className="text-xs text-muted-foreground">Target Price</span>
              <p className="font-mono text-lg font-bold mt-1 profit-text">{strategy.targetPrice}</p>
            </div>
          )}
          {strategy.stopLoss && (
            <div className="stat-card">
              <span className="text-xs text-muted-foreground">Stop Loss</span>
              <p className="font-mono text-lg font-bold mt-1 loss-text">{strategy.stopLoss}</p>
            </div>
          )}
        </div>

        {/* Technical Indicators */}
        {strategy.technicalIndicators && strategy.technicalIndicators.length > 0 && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {strategy.technicalIndicators.map((ind, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="text-sm font-medium">{ind.name}</p>
                      <p className="text-xs text-muted-foreground">{ind.interpretation}</p>
                    </div>
                    <span className="font-mono text-sm">{ind.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Levels */}
        {strategy.keyLevels && (
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <span className="text-xs text-muted-foreground">Support</span>
              <p className="font-mono text-lg font-bold mt-1 profit-text">{strategy.keyLevels.support}</p>
            </div>
            <div className="stat-card">
              <span className="text-xs text-muted-foreground">Resistance</span>
              <p className="font-mono text-lg font-bold mt-1 loss-text">{strategy.keyLevels.resistance}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">LLM Powered Stock Strategy</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Generate trading strategies based on historical analysis across different timeframes.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <StockAutocomplete
          value={ticker}
          onChange={setTicker}
          placeholder="Enter stock ticker (e.g., AAPL)"
          className="flex-1 bg-secondary/50 text-sm"
        />
        <Button type="submit" disabled={loading || !ticker.trim()} className="w-full sm:w-auto text-sm">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Generate Strategy
        </Button>
      </form>

      <Tabs value={activeTimeframe} onValueChange={(v) => { setActiveTimeframe(v); if (ticker.trim() && !strategies[v]) handleGenerate(v); }}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="intraday">Intraday</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="intraday">{renderStrategy("intraday")}</TabsContent>
        <TabsContent value="weekly">{renderStrategy("weekly")}</TabsContent>
        <TabsContent value="monthly">{renderStrategy("monthly")}</TabsContent>
      </Tabs>
    </div>
  );
};

export default Strategy;
