import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  fetchIndexPrices,
  fetchTopMovers,
  fetchSectorPerformance,
  fetchMarketSentiment,
  fetchHotTopics,
  fetchMarketChartData,
  generateMockMarketData,
  MarketData,
  IndexPrice,
  Stock,
  SectorData,
} from "@/lib/api";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const chartConfig = {
  sp500: { label: "S&P 500", color: "hsl(var(--chart-1))" },
  nasdaq: { label: "NASDAQ", color: "hsl(var(--chart-2))" },
};

const sectorChartConfig = {
  change: { label: "Change %", color: "hsl(var(--chart-1))" },
};

const Dashboard = () => {
  const [load, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>(generateMockMarketData());
  const [indices, setIndices] = useState<IndexPrice[]>([]);
  const [topMovers, setTopMovers] = useState<Stock[]>([]);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [sentimentData, setSentimentData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [hotTopics, setHotTopics] = useState<Array<{ topic: string; mentions: number; trend: "up" | "down" }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch all data in parallel
      const [indexData, moversData, sectorPerf, sentiment, topics, chartData] = await Promise.all([
        fetchIndexPrices(),
        fetchTopMovers(),
        fetchSectorPerformance(),
        fetchMarketSentiment(),
        fetchHotTopics(),
        fetchMarketChartData(),
      ]);

      if (indexData.length > 0) {
        setIndices(indexData);
      }
      if (moversData.length > 0) {
        setTopMovers(moversData);
      }
      if (sectorPerf.length > 0) {
        setSectorData(sectorPerf);
      }
      if (sentiment.length > 0) {
        const sentimentWithColors = sentiment.map((s) => ({
          ...s,
          color:
            s.name === "Bullish"
              ? "hsl(145, 70%, 45%)"
              : s.name === "Neutral"
                ? "hsl(38, 92%, 50%)"
                : "hsl(0, 72%, 55%)",
        }));
        setSentimentData(sentimentWithColors);
      }
      if (topics.length > 0) {
        setHotTopics(topics);
      }

      // Update market data with real chart data
      if (chartData.length > 0) {
        setMarketData(chartData);
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load real-time data. Using cached values.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = indices.length > 0 && indices[0]?.price && indices[0].price > 0
    ? [
        {
          label: "S&P 500 (SPY)",
          value: indices[0]?.price?.toFixed(2) || "—",
          change: `${indices[0]?.changePercent?.toFixed(1) || 0}%`,
          up: (indices[0]?.change || 0) >= 0,
          icon: TrendingUp,
        },
        {
          label: "NASDAQ (QQQ)",
          value: indices[1]?.price?.toFixed(2) || "—",
          change: `${indices[1]?.changePercent?.toFixed(1) || 0}%`,
          up: (indices[1]?.change || 0) >= 0,
          icon: Activity,
        },
        {
          label: "DOW (DIA)",
          value: indices[2]?.price?.toFixed(2) || "—",
          change: `${indices[2]?.changePercent?.toFixed(1) || 0}%`,
          up: (indices[2]?.change || 0) >= 0,
          icon: DollarSign,
        },
        {
          label: "Market Status",
          value: "OPEN",
          change: "Market Hours",
          up: true,
          icon: BarChart3,
        },
      ]
    : [];

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Error Alert */}
      {error && (
        <motion.div {...fadeIn}>
          <Alert className="bg-[hsl(var(--loss))]/10 border-[hsl(var(--loss))]/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    
      {/* Refresh Button */}
      <motion.div className="flex justify-end" {...fadeIn}>
        <button
          onClick={loadData}
          disabled={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={load ? "animate-spin" : ""} />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} {...fadeIn} transition={{ delay: i * 0.05, duration: 0.4 }}>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium line-clamp-1">{stat.label}</span>
                <stat.icon size={14} className="text-muted-foreground shrink-0" />
              </div>
              <p className="font-display text-lg sm:text-xl font-bold line-clamp-1">{stat.value}</p>
              <p className={`text-xs font-mono font-medium mt-1 ${stat.up ? "profit-text" : "loss-text"}`}>
                {stat.up && "+"}{stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main market chart */}
        <motion.div className="xl:col-span-2" {...fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] sm:h-[280px] w-full">
                <AreaChart data={marketData}>
                  <defs>
                    <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} domain={["dataMin - 20", "dataMax + 20"]} width={35} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="sp500" stroke="hsl(var(--chart-1))" fill="url(#sp500Gradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sentiment pie */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Market Sentiment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[150px] sm:h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                      {sentimentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 w-full">
                {sentimentData.map((s) => (
                  <div key={s.name} className="flex flex-col items-center gap-1 text-xs text-center">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-muted-foreground line-clamp-1">{s.name}</span>
                    <span className="font-mono font-medium text-xs">{s.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Sector performance */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sectorChartConfig} className="h-[180px] sm:h-[220px] w-full">
                <BarChart data={sectorData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="sector" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={50} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="change" radius={[0, 4, 4, 0]}>
                    {sectorData.map((entry, i) => (
                      <Cell key={i} fill={entry.change >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top movers */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Movers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topMovers.slice(0, 4).map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between py-1 text-sm">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-mono text-sm font-medium">${stock.price.toFixed(2)}</p>
                    <p className={`text-xs font-mono ${stock.changePercent >= 0 ? "profit-text" : "loss-text"}`}>
                      {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Hot topics */}
        <motion.div {...fadeIn} transition={{ delay: 0.45 }}>
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-warning shrink-0" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Hot Topics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {hotTopics.slice(0, 4).map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between py-1 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {topic.trend === "up" ? (
                      <TrendingUp size={14} className="profit-text shrink-0" />
                    ) : (
                      <TrendingDown size={14} className="loss-text shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{topic.topic}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0 ml-2">{topic.mentions.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
