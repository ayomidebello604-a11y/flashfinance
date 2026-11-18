export interface MarketData {
  time: string;
  sp500?: number;
  nasdaq?: number;
  dow?: number;
}

export interface IndexPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number | null;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SectorData {
  sector: string;
  change: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  timestamp: number;
  summary: string;
  category: string;
  url: string;
}

export interface DashboardData {
  indices: IndexPrice[];
  popularStocks: Stock[];
  sectors: SectorData[];
  sentiment: Array<{ name: string; value: number }>;
  hotTopics: Array<{ topic: string; mentions: number; trend: "up" | "down" | "neutral" }>;
  chartData: MarketData[];
  marketStatus: { isOpen: boolean; session: string | null } | null;
  asOf: string | null;
  errors: string[];
}

export interface MarketNewsResponse {
  articles: NewsArticle[];
  notice: string | null;
}
