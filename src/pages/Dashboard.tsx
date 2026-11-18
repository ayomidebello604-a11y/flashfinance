import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, RefreshCw, AlertCircle, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "#src/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "#src/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Alert, AlertDescription } from "#src/components/ui/alert";
import { fetchDashboardData } from "#src/lib/api";
import type { IndexPrice, MarketData, SectorData, Stock } from "#src/lib/market-types";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const chartConfig = {
  sp500: { label: "S&P 500", color: "hsl(var(--chart-1))" },
  nasdaq: { label: "NASDAQ", color: "hsl(var(--chart-2))" },
  dow: { label: "Dow Jones", color: "hsl(var(--chart-3))" },
};

const sectorChartConfig = {
  change: { label: "Change %", color: "hsl(var(--chart-1))" },
};

const Dashboard = () => {
  const {
    data,
    isFetching: load,
    error: requestError,
    refetch,
  } = useQuery({
    queryKey: ["live-market-dashboard"],
    queryFn: fetchDashboardData,
    refetchInterval: 300000,
    staleTime: 30000,
  });
  const indices: IndexPrice[] = data?.indices ?? [];
  const popularStocks: Stock[] = data?.popularStocks ?? [];
  const sectorData: SectorData[] = data?.sectors ?? [];
  const marketData: MarketData[] = data?.chartData ?? [];
  const sentimentData = (data?.sentiment ?? []).map((item) => ({
    ...item,
    color:
      item.name === "Bullish"
        ? "hsl(145, 70%, 45%)"
        : item.name === "Neutral"
          ? "hsl(38, 92%, 50%)"
          : "hsl(0, 72%, 55%)",
  }));
  const hotTopics = data?.hotTopics ?? [];
  const marketStatus = data?.marketStatus ?? null;
  const lastUpdate = data?.asOf ? new Date(data.asOf) : null;
  const detail = data?.errors.slice(0, 3).join(" ");
  const remaining = Math.max(0, (data?.errors.length ?? 0) - 3);
  const error = requestError instanceof Error
    ? `Live market data is unavailable: ${requestError.message}`
    : detail
      ? `Some live feeds are unavailable: ${detail}${remaining > 0 ? ` (${remaining} more issue${remaining === 1 ? "" : "s"}).` : ""}`
      : null;

  const stats = [
    { symbol: "SPY", label: "S&P 500 ETF (SPY)", icon: TrendingUp },
    { symbol: "QQQ", label: "NASDAQ-100 ETF (QQQ)", icon: Activity },
    { symbol: "DIA", label: "Dow Jones ETF (DIA)", icon: DollarSign },
  ].map(({ symbol, label, icon }) => {
    const quote = indices.find((item) => item.symbol === symbol);
    return {
      label,
      value: quote ? quote.price.toFixed(2) : "Unavailable",
      change: quote ? `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "No live quote",
      up: quote ? quote.change >= 0 : false,
      icon,
    };
  }).concat({
    label: "Market Status",
    value: marketStatus ? (marketStatus.isOpen ? "OPEN" : "CLOSED") : "Unavailable",
    change: marketStatus?.session || "No live status",
    up: marketStatus?.isOpen ?? false,
    icon: BarChart3,
  });

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
          onClick={() => void refetch()}
          disabled={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={load ? "animate-spin" : ""} />
          Last quote: {lastUpdate ? lastUpdate.toLocaleTimeString() : "Unavailable"}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Market Overview · Index Trend (ET)</CardTitle>
            </CardHeader>
            <CardContent>
              {marketData.length === 0 ? (
                <p className="flex h-50 items-center justify-center text-sm text-muted-foreground sm:h-50">
                  Live candle data is unavailable.
                </p>
              ) : (
                <ChartContainer config={chartConfig} className="h-50 sm:h-70 w-full">
                  <AreaChart data={marketData}>
                    <defs>
                      <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} domain={["auto", "auto"]} width={45} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="sp500" stroke="hsl(var(--chart-1))" fill="url(#sp500Gradient)" strokeWidth={2} connectNulls />
                    <Area type="monotone" dataKey="nasdaq" stroke="hsl(var(--chart-2))" fill="none" strokeWidth={2} connectNulls />
                    <Area type="monotone" dataKey="dow" stroke="hsl(var(--chart-3))" fill="none" strokeWidth={2} connectNulls />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sentiment pie */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Market Sentiment · News-derived</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-37.5 sm:h-45 w-full">
                {sentimentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                        {sentimentData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Live news sentiment unavailable.
                  </p>
                )}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Sector ETF Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {sectorData.length === 0 ? (
                <p className="flex h-45 items-center justify-center text-sm text-muted-foreground sm:h-55">
                  Live sector data is unavailable.
                </p>
              ) : (
                <ChartContainer config={sectorChartConfig} className="h-45 sm:h-55 w-full">
                  <BarChart data={sectorData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="sector" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={110} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="change" radius={[0, 4, 4, 0]}>
                      {sectorData.map((entry, i) => (
                        <Cell key={i} fill={entry.change >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular stocks */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Popular Stocks · Live Quotes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularStocks.length > 0 ? (
                popularStocks.slice(0, 4).map((stock) => (
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
                ))
              ) : (
                <p className="py-4 text-sm text-muted-foreground">Live stock quotes are unavailable.</p>
              )}
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
              {hotTopics.length > 0 ? (
                hotTopics.slice(0, 4).map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between py-1 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {topic.trend === "up" ? (
                        <TrendingUp size={14} className="profit-text shrink-0" />
                      ) : topic.trend === "down" ? (
                        <TrendingDown size={14} className="loss-text shrink-0" />
                      ) : (
                        <Minus size={14} className="text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{topic.topic}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0 ml-2">{topic.mentions.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-muted-foreground">No current news topics are available.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
