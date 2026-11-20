import { handleMarketRequest } from "../dist/src/server/market.js";

// Web Fetch standard export for Vercel Serverless Functions
export async function GET(request) {
  return handleMarketRequest(request);
}

// Fallback for legacy Node (req, res) environments
export default async function handler(req, res) {
  if (!res && req instanceof Request) {
    return handleMarketRequest(req);
  }

  const host = req.headers?.host || "localhost";
  const protocol = req.headers?.["x-forwarded-proto"] || "http";
  const webRequest = new Request(`${protocol}://${host}${req.url}`, {
    method: req.method || "GET",
    headers: req.headers,
  });

  const webResponse = await handleMarketRequest(webRequest);
  res.statusCode = webResponse.status;
  webResponse.headers.forEach((val, key) => res.setHeader(key, val));
  const body = await webResponse.text();
  res.end(body);
}
