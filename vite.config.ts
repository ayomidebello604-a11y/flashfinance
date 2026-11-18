import { defineConfig, loadEnv } from "vite";
import { Buffer } from "node:buffer";
import type { IncomingMessage, ServerResponse } from "node:http";
import { cwd, env } from "node:process";
import { handleGeminiRequest } from "./src/server/gemini.ts";
import { handleMarketRequest } from "./src/server/market.ts";

const MAX_BODY_BYTES = 24 * 1024;
type NextFunction = (error?: unknown) => void;

function apiMiddleware(route: string, handler: (request: Request) => Promise<Response>) {
  return (request: IncomingMessage, response: ServerResponse, next: NextFunction) => {
    void (async () => {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of request) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += bytes.byteLength;
        if (size > MAX_BODY_BYTES) {
          response.statusCode = 413;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "Request is too large." }));
          return;
        }
        chunks.push(bytes);
      }

      const headers = new Headers();
      if (request.headers.host) headers.set("host", request.headers.host);
      if (request.headers.origin) headers.set("origin", request.headers.origin);
      const requestBody = Buffer.concat(chunks).toString("utf8");
      const originalUrl = new URL(request.url || "/", "http://localhost");
      const apiRequest = new Request(`http://localhost/api/${route}${originalUrl.search}`, {
        method: request.method || "GET",
        headers,
        body: ["GET", "HEAD"].includes(request.method || "GET") ? undefined : requestBody,
      });
      const apiResponse = await handler(apiRequest);
      response.statusCode = apiResponse.status;
      apiResponse.headers.forEach((value, name) => response.setHeader(name, value));

      if (!apiResponse.body) {
        response.end();
        return;
      }

      const reader = apiResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        response.write(Buffer.from(value));
      }
      response.end();
    })().catch(next);
  };
}

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, cwd(), "");
  if (loadedEnv.GEMINI_API_KEY) env.GEMINI_API_KEY = loadedEnv.GEMINI_API_KEY;
  if (loadedEnv.GEMINI_MODEL) env.GEMINI_MODEL = loadedEnv.GEMINI_MODEL;
  if (loadedEnv.FINNHUB_API_KEY) env.FINNHUB_API_KEY = loadedEnv.FINNHUB_API_KEY;
  if (loadedEnv.VITE_FINNHUB_API_KEY) env.VITE_FINNHUB_API_KEY = loadedEnv.VITE_FINNHUB_API_KEY;
  if (loadedEnv.ALPHA_VANTAGE_API_KEY) env.ALPHA_VANTAGE_API_KEY = loadedEnv.ALPHA_VANTAGE_API_KEY;
  if (loadedEnv.VITE_ALPHA_VANTAGE_API_KEY) env.VITE_ALPHA_VANTAGE_API_KEY = loadedEnv.VITE_ALPHA_VANTAGE_API_KEY;

  return {
    envPrefix: ["VITE_SUPABASE_"],
    plugins: [
      {
        name: "flashfinance-api-dev",
        configureServer(server) {
          server.middlewares.use("/api/ai", apiMiddleware("ai", handleGeminiRequest));
          server.middlewares.use("/api/market", apiMiddleware("market", handleMarketRequest));
        },
      },
    ],
  };
});
