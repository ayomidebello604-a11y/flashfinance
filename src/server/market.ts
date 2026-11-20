import { env } from "node:process";
import type {
  DashboardData,
  IndexPrice,
  MarketData,
  NewsArticle,
  SectorData,
} from "../lib/market-types.ts";

const FINNHUB_URL = "https://finnhub.io/api/v1";
const BENCHMARKS = [
  { symbol: "SPY", name: "S&P 500 ETF", key: "sp500" },
  { symbol: "QQQ", name: "NASDAQ-100 ETF", key: "nasdaq" },
  { symbol: "DIA", name: "Dow Jones ETF", key: "dow" },
] as const;
const POPULAR_STOCKS = [
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "META", name: "Meta" },
] as const;
const SECTOR_ETFS = [
  { symbol: "XLK", sector: "Technology" },
  { symbol: "XLV", sector: "Healthcare" },
  { symbol: "XLF", sector: "Financials" },
  { symbol: "XLY", sector: "Consumer Discretionary" },
  { symbol: "XLI", sector: "Industrials" },
  { symbol: "XLE", sector: "Energy" },
] as const;

interface FinnhubQuote {
  c?: unknown;
  d?: unknown;
  dp?: unknown;
  pc?: unknown;
  t?: unknown;
}

interface FinnhubCandle {
  s?: unknown;
  c?: unknown;
  t?: unknown;
}

interface FinnhubArticle {
  id?: unknown;
  headline?: unknown;
  source?: unknown;
  datetime?: unknown;
  summary?: unknown;
  category?: unknown;
  url?: unknown;
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFinnhubKey(): string {
  return (env.FINNHUB_API_KEY || env.VITE_FINNHUB_API_KEY || "").trim();
}

function getAlphaVantageKey(): string {
  return (env.ALPHA_VANTAGE_API_KEY || env.VITE_ALPHA_VANTAGE_API_KEY || "").trim();
}

let cachedAlphaVantageChart: { timestamp: number; data: MarketData[] } | null = null;
const CHART_CACHE_TTL_MS = 30 * 60 * 1000;

async function fetchFinnhub<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = getFinnhubKey();
  if (!key) throw new Error("Finnhub API key is not configured on the server.");

  const url = new URL(`${FINNHUB_URL}${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  url.searchParams.set("token", key);

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new Error("Could not connect to Finnhub.");
  }
  if (!response.ok) {
    if (response.status === 403 && path.includes("candle")) {
      throw new Error("Finnhub candle data requires a paid Finnhub subscription (HTTP 403).");
    }
    throw new Error(`Finnhub returned HTTP ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Finnhub returned an invalid response.");
  }
  if (isRecord(payload) && typeof payload.error === "string") {
    throw new Error(`Finnhub rejected the request: ${payload.error}`);
  }
  return payload as T;
}

async function fetchQuote(symbol: string, name: string): Promise<IndexPrice> {
  const quote = await fetchFinnhub<FinnhubQuote>("/quote", { symbol });
  const price = asNumber(quote.c);
  const previousClose = asNumber(quote.pc);
  if (price === null || price <= 0) throw new Error(`No live quote was returned for ${symbol}.`);

  const change = asNumber(quote.d) ?? (
    previousClose === null ? null : price - previousClose
  );
  const changePercent = asNumber(quote.dp) ?? (
    previousClose === null || previousClose === 0 || change === null
      ? null
      : (change / previousClose) * 100
  );
  if (change === null || changePercent === null) {
    throw new Error(`Finnhub returned an incomplete quote for ${symbol}.`);
  }
  const timestamp = asNumber(quote.t);

  return {
    symbol,
    name,
    price,
    change,
    changePercent,
    timestamp: timestamp !== null && timestamp > 0 ? timestamp : null,
  };
}

async function collectQuotes<T extends { symbol: string }>(
  symbols: readonly T[],
  errors: string[],
): Promise<IndexPrice[]> {
  const results = await Promise.allSettled(
    symbols.map((item) => fetchQuote(item.symbol, "name" in item ? String(item.name) : item.symbol)),
  );
  const quotes: IndexPrice[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") quotes.push(result.value);
    else errors.push(`${symbols[index].symbol}: ${errorMessage(result.reason)}`);
  });
  return quotes;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The data provider request failed.";
}

function formatTimeAgo(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - timestamp * 1000) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function mapArticles(data: unknown, now = Date.now()): NewsArticle[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item: FinnhubArticle) => {
    const timestamp = asNumber(item.datetime);
    if (typeof item.headline !== "string" || typeof item.url !== "string" || timestamp === null) return [];
    let url: URL;
    try {
      url = new URL(item.url);
    } catch {
      return [];
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return [];

    return [{
      id: String(item.id ?? item.url),
      title: item.headline,
      source: typeof item.source === "string" ? item.source : "Finnhub",
      timeAgo: formatTimeAgo(timestamp, now),
      timestamp,
      summary: typeof item.summary === "string" ? item.summary : "",
      category: typeof item.category === "string" ? item.category : "News",
      url: item.url,
    }];
  }).sort((a, b) => b.timestamp - a.timestamp);
}

async function fetchGeneralNews(): Promise<NewsArticle[]> {
  const data = await fetchFinnhub<unknown>("/news", { category: "general" });
  return mapArticles(data).slice(0, 40);
}

function classifyHeadline(text: string): "up" | "down" | "neutral" {
  const normalized = text.toLowerCase();
  const positive = ["surge", "gain", "rally", "soar", "jump", "profit", "growth", "strong", "beat", "upgrade"];
  const negative = ["fall", "decline", "drop", "plunge", "loss", "weak", "miss", "downgrade", "cut"];
  const positiveCount = positive.filter((word) => normalized.includes(word)).length;
  const negativeCount = negative.filter((word) => normalized.includes(word)).length;
  if (positiveCount > negativeCount) return "up";
  if (negativeCount > positiveCount) return "down";
  return "neutral";
}

function analyzeNews(articles: NewsArticle[]) {
  if (articles.length === 0) return { sentiment: [], hotTopics: [] };

  let bullish = 0;
  let bearish = 0;
  for (const article of articles) {
    const score = classifyHeadline(`${article.title} ${article.summary}`);
    if (score === "up") bullish++;
    if (score === "down") bearish++;
  }
  const total = articles.length;
  const bullishPercent = Math.round((bullish / total) * 100);
  const bearishPercent = Math.round((bearish / total) * 100);
  const sentiment = [
    { name: "Bullish", value: bullishPercent },
    { name: "Neutral", value: 100 - bullishPercent - bearishPercent },
    { name: "Bearish", value: bearishPercent },
  ];

  const terms = ["Technology", "AI", "Earnings", "Fed", "Inflation", "Crypto", "Energy", "Healthcare", "Real Estate", "Banking"];
  const hotTopics = terms.flatMap((topic) => {
    const mentions = articles.filter((article) =>
      `${article.title} ${article.summary}`.toLowerCase().includes(topic.toLowerCase()),
    );
    if (mentions.length === 0) return [];
    const up = mentions.filter((article) => classifyHeadline(article.title) === "up").length;
    const down = mentions.filter((article) => classifyHeadline(article.title) === "down").length;
    const trend = up > down ? "up" as const : down > up ? "down" as const : "neutral" as const;
    return [{ topic, mentions: mentions.length, trend }];
  }).sort((a, b) => b.mentions - a.mentions).slice(0, 5);

  return { sentiment, hotTopics };
}

async function fetchAlphaVantageChartData(errors: string[]): Promise<MarketData[]> {
  const key = getAlphaVantageKey();
  if (!key) return [];

  if (cachedAlphaVantageChart && Date.now() - cachedAlphaVantageChart.timestamp < CHART_CACHE_TTL_MS) {
    return cachedAlphaVantageChart.data;
  }

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const pointsMap = new Map<string, MarketData>();

  for (let i = 0; i < BENCHMARKS.length; i++) {
    const benchmark = BENCHMARKS[i];
    if (i > 0) await wait(1200);

    try {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${benchmark.symbol}&apikey=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`${benchmark.symbol} chart: Alpha Vantage returned HTTP ${res.status}.`);
        continue;
      }
      const data = (await res.json()) as Record<string, unknown>;
      const series = data["Time Series (Daily)"];
      if (!isRecord(series)) {
        const msg =
          typeof data["Note"] === "string"
            ? data["Note"]
            : typeof data["Information"] === "string"
              ? data["Information"]
              : "No daily series returned.";
        console.warn(`Alpha Vantage (${benchmark.symbol}):`, msg);
        continue;
      }

      const dates = Object.keys(series).sort().slice(-20);
      for (const d of dates) {
        const item = series[d];
        if (!isRecord(item)) continue;
        const close = asNumber(item["4. close"]);
        if (close === null) continue;

        if (!pointsMap.has(d)) {
          const dateObj = new Date(`${d}T00:00:00Z`);
          const time = dateObj.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });
          pointsMap.set(d, { time });
        }
        pointsMap.get(d)![benchmark.key] = close;
      }
    } catch (err) {
      errors.push(`${benchmark.symbol} chart: ${errorMessage(err)}`);
    }
  }

  const result = Array.from(pointsMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, point]) => point);

  if (result.length > 0) {
    cachedAlphaVantageChart = { timestamp: Date.now(), data: result };
    return result;
  }

  if (cachedAlphaVantageChart) {
    return cachedAlphaVantageChart.data;
  }

  return [];
}

async function fetchFinnhubCandles(errors: string[]): Promise<MarketData[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 3 * 24 * 60 * 60;
  const candles = await Promise.allSettled(
    BENCHMARKS.map(async (benchmark) => ({
      benchmark,
      response: await fetchFinnhub<FinnhubCandle>("/stock/candle", {
        symbol: benchmark.symbol,
        resolution: "30",
        from: String(from),
        to: String(now),
      }),
    })),
  );

  const points = new Map<number, MarketData>();
  candles.forEach((result, index) => {
    if (result.status === "rejected") {
      errors.push(`${BENCHMARKS[index].symbol} chart: ${errorMessage(result.reason)}`);
      return;
    }

    const { benchmark, response } = result.value;
    if (
      response.s !== "ok" ||
      !Array.isArray(response.t) ||
      !Array.isArray(response.c) ||
      response.t.length !== response.c.length
    ) {
      errors.push(`${benchmark.symbol} chart: Finnhub returned no candle data.`);
      return;
    }

    response.t.forEach((timestamp, pointIndex) => {
      const time = asNumber(timestamp);
      const close = asNumber(response.c?.[pointIndex]);
      if (time === null || close === null) return;
      const point = points.get(time) || {
        time: new Date(time * 1000).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          timeZone: "America/New_York",
        }),
      };
      point[benchmark.key] = close;
      points.set(time, point);
    });
  });

  const data = Array.from(points.entries())
    .sort(([a], [b]) => a - b)
    .map(([, point]) => point);
  if (data.length === 0) errors.push("Market chart: no live candle data is available.");
  return data;
}

async function fetchChartData(errors: string[]): Promise<MarketData[]> {
  if (getAlphaVantageKey()) {
    const alphaErrors: string[] = [];
    const alphaVantageData = await fetchAlphaVantageChartData(alphaErrors);
    if (alphaVantageData.length > 0) {
      return alphaVantageData;
    }
  }
  return fetchFinnhubCandles(errors);
}

async function fetchSectorPerformance(errors: string[]): Promise<SectorData[]> {
  const quotes = await collectQuotes(SECTOR_ETFS, errors);
  const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  return SECTOR_ETFS.flatMap(({ symbol, sector }) => {
    const quote = bySymbol.get(symbol);
    return quote ? [{ sector, change: quote.changePercent }] : [];
  });
}

async function fetchMarketStatus(): Promise<{ isOpen: boolean; session: string | null }> {
  const status = await fetchFinnhub<unknown>("/stock/market-status", { exchange: "US" });
  if (!isRecord(status) || typeof status.isOpen !== "boolean") {
    throw new Error("Finnhub returned an invalid market status.");
  }
  return {
    isOpen: status.isOpen,
    session: typeof status.session === "string" ? status.session : null,
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const errors: string[] = [];
  const [indices, popularStocks, sectors, chartData, newsResult, marketStatusResult] = await Promise.all([
    collectQuotes(BENCHMARKS, errors),
    collectQuotes(POPULAR_STOCKS, errors),
    fetchSectorPerformance(errors),
    fetchChartData(errors),
    fetchGeneralNews().catch((error: unknown) => {
      errors.push(`Market news: ${errorMessage(error)}`);
      return [];
    }),
    fetchMarketStatus().catch((error: unknown) => {
      errors.push(`Market status: ${errorMessage(error)}`);
      return null;
    }),
  ]);
  if (newsResult.length === 0 && !errors.some((error) => error.startsWith("Market news:"))) {
    errors.push("Market news: Finnhub returned no live headlines.");
  }

  const { sentiment, hotTopics } = analyzeNews(newsResult);
  const quoteTimestamps = indices
    .map((quote) => quote.timestamp)
    .filter((timestamp): timestamp is number => timestamp !== null);
  const asOf = quoteTimestamps.length > 0
    ? new Date(Math.max(...quoteTimestamps) * 1000).toISOString()
    : null;

  return {
    indices,
    popularStocks,
    sectors,
    sentiment,
    hotTopics,
    chartData,
    marketStatus: marketStatusResult,
    asOf,
    errors,
  };
}

export async function fetchMarketNews(query: string) {
  const normalized = query.trim();
  if (!normalized) {
    const articles = await fetchGeneralNews();
    return { articles, notice: null };
  }

  if (/^[A-Z0-9.-]{1,10}$/.test(normalized) && normalized === normalized.toUpperCase()) {
    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    const data = await fetchFinnhub<unknown>("/company-news", {
      symbol: normalized,
      from,
      to,
    });
    return { articles: mapArticles(data).slice(0, 40), notice: null };
  }

  const generalNews = await fetchGeneralNews();
  const term = normalized.toLowerCase();
  const matchingArticles = generalNews.filter((article) =>
    `${article.title} ${article.summary} ${article.source}`.toLowerCase().includes(term),
  );
  if (matchingArticles.length > 0) return { articles: matchingArticles, notice: null };
  return {
    articles: generalNews,
    notice: `No current headlines matched "${normalized}". Showing the latest general market headlines.`,
  };
}

export async function handleMarketRequest(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ error: "Use GET for market data requests." }, 405);
  }
  if (!getFinnhubKey()) {
    return jsonResponse({
      error: "The server is missing FINNHUB_API_KEY (or VITE_FINNHUB_API_KEY for existing local setups).",
    }, 500);
  }

  const host = request.headers?.get?.("host") || "localhost";
  const url = new URL(request.url, `http://${host}`);
  const view = url.searchParams.get("view");
  try {
    if (view === "dashboard") return jsonResponse(await fetchDashboardData());
    if (view === "news") {
      const query = url.searchParams.get("query") || "";
      if (query.length > 100) return jsonResponse({ error: "News search must be 100 characters or fewer." }, 400);
      return jsonResponse(await fetchMarketNews(query));
    }
    if (view === "quote") {
      const symbol = url.searchParams.get("symbol")?.trim().toUpperCase() || "";
      if (!/^[A-Z0-9.-]{1,10}$/.test(symbol)) {
        return jsonResponse({ error: "A valid stock ticker is required." }, 400);
      }
      return jsonResponse(await fetchQuote(symbol, symbol));
    }
    return jsonResponse({ error: "Unsupported market data view." }, 400);
  } catch (error) {
    const message = errorMessage(error);
    const status = message.includes("HTTP 429") ? 429 : 502;
    console.error("Market data request failed:", message);
    return jsonResponse({ error: message }, status);
  }
}
