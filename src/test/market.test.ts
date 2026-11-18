// @vitest-environment node
import { env } from "node:process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDashboardData, handleMarketRequest } from "../server/market";

const originalFinnhubKey = env.FINNHUB_API_KEY;
const originalViteFinnhubKey = env.VITE_FINNHUB_API_KEY;

afterEach(() => {
  if (originalFinnhubKey === undefined) delete env.FINNHUB_API_KEY;
  else env.FINNHUB_API_KEY = originalFinnhubKey;
  if (originalViteFinnhubKey === undefined) delete env.VITE_FINNHUB_API_KEY;
  else env.VITE_FINNHUB_API_KEY = originalViteFinnhubKey;
  vi.unstubAllGlobals();
});

describe("market data API", () => {
  it("maps provider quotes and real candle closes without fabricating chart values", async () => {
    env.FINNHUB_API_KEY = "test-server-key";
    const timestamp = 1_700_000_000;
    const marketFetch = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/quote")) {
        return Response.json({ c: 100, d: 2, dp: 2, pc: 98, t: timestamp });
      }
      if (url.pathname.endsWith("/stock/candle")) {
        return Response.json({ s: "ok", t: [timestamp], c: [101] });
      }
      if (url.pathname.endsWith("/news")) {
        return Response.json([{
          id: 1,
          headline: "AI earnings surge",
          source: "Test Publisher",
          datetime: timestamp,
          summary: "Technology company reports results.",
          category: "company",
          url: "https://example.com/story",
        }]);
      }
      if (url.pathname.endsWith("/stock/market-status")) {
        return Response.json({ isOpen: true, session: "regular" });
      }
      return new Response("Not found", { status: 404 });
    });
    vi.stubGlobal("fetch", marketFetch);

    const data = await fetchDashboardData();

    expect(data.indices[0]).toMatchObject({ symbol: "SPY", price: 100, change: 2, changePercent: 2 });
    expect(data.popularStocks[0]).toMatchObject({ symbol: "NVDA", price: 100 });
    expect(data.sectors[0]).toEqual({ sector: "Technology", change: 2 });
    expect(data.chartData).toHaveLength(1);
    expect(data.chartData[0]).toMatchObject({ sp500: 101, nasdaq: 101, dow: 101 });
    expect(data.marketStatus).toEqual({ isOpen: true, session: "regular" });
    expect(data.sentiment).toEqual([
      { name: "Bullish", value: 100 },
      { name: "Neutral", value: 0 },
      { name: "Bearish", value: 0 },
    ]);
    expect(data.errors).toEqual([]);
  });

  it("returns an explicit missing-key error without requesting provider data", async () => {
    env.FINNHUB_API_KEY = "";
    env.VITE_FINNHUB_API_KEY = "";
    const marketFetch = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", marketFetch);

    const response = await handleMarketRequest(
      new Request("http://localhost/api/market?view=dashboard"),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "The server is missing FINNHUB_API_KEY (or VITE_FINNHUB_API_KEY for existing local setups).",
    });
    expect(marketFetch).not.toHaveBeenCalled();
  });

  it("derives quote changes from the previous close when provider change fields are missing", async () => {
    env.FINNHUB_API_KEY = "test-server-key";
    const marketFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ c: 101, d: null, dp: null, pc: 100, t: null }),
    );
    vi.stubGlobal("fetch", marketFetch);

    const response = await handleMarketRequest(
      new Request("http://localhost/api/market?view=quote&symbol=TEST"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      symbol: "TEST",
      price: 101,
      change: 1,
      changePercent: 1,
      timestamp: null,
    });
  });

  it("returns empty data and provider errors instead of mock values when Finnhub fails", async () => {
    env.FINNHUB_API_KEY = "test-server-key";
    const marketFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("Unauthorized", { status: 401 }),
    );
    vi.stubGlobal("fetch", marketFetch);

    const data = await fetchDashboardData();

    expect(data.indices).toEqual([]);
    expect(data.popularStocks).toEqual([]);
    expect(data.sectors).toEqual([]);
    expect(data.chartData).toEqual([]);
    expect(data.sentiment).toEqual([]);
    expect(data.hotTopics).toEqual([]);
    expect(data.marketStatus).toBeNull();
    expect(data.errors.length).toBeGreaterThan(0);
  });
});
