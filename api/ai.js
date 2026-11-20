import { handleGeminiRequest } from "../dist/src/server/gemini.js";

// Web Fetch standard export for Vercel Serverless Functions
export async function POST(request) {
  return handleGeminiRequest(request);
}

// Fallback for legacy Node (req, res) environments
export default async function handler(req, res) {
  if (!res && req instanceof Request) {
    return handleGeminiRequest(req);
  }

  const host = req.headers?.host || "localhost";
  const protocol = req.headers?.["x-forwarded-proto"] || "http";

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const body = Buffer.concat(chunks).toString("utf-8");

  const webRequest = new Request(`${protocol}://${host}${req.url}`, {
    method: req.method || "POST",
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
  });

  const webResponse = await handleGeminiRequest(webRequest);
  res.statusCode = webResponse.status;
  webResponse.headers.forEach((val, key) => res.setHeader(key, val));

  if (!webResponse.body) {
    res.end();
    return;
  }

  const reader = webResponse.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}
