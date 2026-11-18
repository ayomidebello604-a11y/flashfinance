// @vitest-environment node
import { env } from "node:process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleGeminiRequest } from "../server/gemini";

const originalApiKey = env.GEMINI_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) delete env.GEMINI_API_KEY;
  else env.GEMINI_API_KEY = originalApiKey;
  vi.unstubAllGlobals();
});

describe("Gemini API handler", () => {
  it("uses the server key and returns Gemini structured output", async () => {
    env.GEMINI_API_KEY = "test-server-key";
    const report = { ticker: "AAPL", summary: "Example report" };
    const geminiFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify(report) }] } }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", geminiFetch);

    const request = new Request("http://localhost/api/ai", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost",
        origin: "http://localhost",
      },
      body: JSON.stringify({ action: "research", ticker: "AAPL" }),
    });
    const response = await handleGeminiRequest(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(report);
    expect(geminiFetch).toHaveBeenCalledOnce();
    const [endpoint, init] = geminiFetch.mock.calls[0];
    expect(String(endpoint)).toContain(":generateContent");
    expect(new Headers(init?.headers).get("x-goog-api-key")).toBe("test-server-key");
  });

  it("returns an explicit configuration error without calling Gemini", async () => {
    env.GEMINI_API_KEY = "";
    const geminiFetch = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", geminiFetch);

    const response = await handleGeminiRequest(
      new Request("http://localhost/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "risk", query: "A company" }),
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "The server is missing GEMINI_API_KEY.",
    });
    expect(geminiFetch).not.toHaveBeenCalled();
  });
});
