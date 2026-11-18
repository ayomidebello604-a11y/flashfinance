import type {
  DashboardData,
  IndexPrice,
  MarketNewsResponse,
} from "./market-types";

async function requestMarket<T>(params: Record<string, string>): Promise<T> {
  const search = new URLSearchParams(params);
  const response = await fetch(`/api/market?${search.toString()}`);
  const responseText = await response.text();

  let payload: unknown;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error(`Market data server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `Market data request failed with HTTP ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

export function fetchDashboardData(): Promise<DashboardData> {
  return requestMarket<DashboardData>({ view: "dashboard" });
}

export function fetchLiveNews(query = ""): Promise<MarketNewsResponse> {
  return requestMarket<MarketNewsResponse>({ view: "news", query });
}

export function fetchMarketQuote(symbol: string): Promise<IndexPrice> {
  return requestMarket<IndexPrice>({ view: "quote", symbol });
}
