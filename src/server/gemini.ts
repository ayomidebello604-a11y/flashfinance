import { env } from "node:process";

type AiAction = "research" | "strategy" | "news" | "sentiment" | "risk" | "chat";
type ChatMessage = { role: "user" | "assistant"; content: string };
const AI_ACTIONS: ReadonlySet<string> = new Set<AiAction>([
  "research",
  "strategy",
  "news",
  "sentiment",
  "risk",
  "chat",
]);

const MAX_REQUEST_BYTES = 24 * 1024;
const STRING = { type: "STRING" };
const STRING_ARRAY = { type: "ARRAY", items: STRING };
const percentage = { type: "INTEGER", minimum: 0, maximum: 100 };
const enumString = (values: string[]) => ({ type: "STRING", enum: values });

const objectSchema = (properties: Record<string, unknown>) => ({
  type: "OBJECT",
  properties,
  required: Object.keys(properties),
});

const schemas: Record<Exclude<AiAction, "chat">, object> = {
  research: objectSchema({
    company: STRING,
    ticker: STRING,
    sector: STRING,
    price: STRING,
    marketCap: STRING,
    peRatio: STRING,
    summary: STRING,
    strengths: STRING_ARRAY,
    risks: STRING_ARRAY,
    catalysts: STRING_ARRAY,
    analystConsensus: enumString(["Buy", "Hold", "Sell", "Unavailable"]),
    priceTarget: STRING,
    outlook: STRING,
  }),
  strategy: objectSchema({
    ticker: STRING,
    timeframe: enumString(["intraday", "weekly", "monthly"]),
    signal: enumString(["BUY", "SELL", "HOLD"]),
    confidence: percentage,
    entryPrice: STRING,
    targetPrice: STRING,
    stopLoss: STRING,
    rationale: STRING,
    technicalIndicators: {
      type: "ARRAY",
      items: objectSchema({
        name: STRING,
        value: STRING,
        interpretation: STRING,
      }),
    },
    keyLevels: objectSchema({ support: STRING, resistance: STRING }),
    riskReward: STRING,
  }),
  news: objectSchema({
    topic: STRING,
    summary: STRING,
    articles: {
      type: "ARRAY",
      items: objectSchema({
        title: STRING,
        source: STRING,
        timeAgo: STRING,
        summary: STRING,
        sentiment: enumString(["positive", "negative", "neutral"]),
        impact: enumString(["high", "medium", "low"]),
      }),
    },
    overallSentiment: enumString(["positive", "negative", "neutral"]),
    keyTakeaway: STRING,
  }),
  sentiment: objectSchema({
    ticker: STRING,
    overallSentiment: enumString(["Bullish", "Bearish", "Neutral"]),
    sentimentScore: percentage,
    sources: {
      type: "ARRAY",
      items: objectSchema({
        name: STRING,
        sentiment: enumString(["Bullish", "Bearish", "Neutral"]),
        score: percentage,
        highlights: STRING_ARRAY,
      }),
    },
    trendingTopics: STRING_ARRAY,
    summary: STRING,
  }),
  risk: objectSchema({
    subject: STRING,
    overallRiskLevel: enumString(["Low", "Medium", "High", "Critical"]),
    riskScore: percentage,
    risks: {
      type: "ARRAY",
      items: objectSchema({
        category: enumString(["Market", "Regulatory", "Operational", "Financial", "Competitive", "Geopolitical"]),
        title: STRING,
        severity: enumString(["Low", "Medium", "High", "Critical"]),
        likelihood: enumString(["Low", "Medium", "High"]),
        description: STRING,
        mitigation: STRING,
      }),
    },
    summary: STRING,
    recommendation: STRING,
  }),
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isAiAction = (value: unknown): value is AiAction =>
  typeof value === "string" && AI_ACTIONS.has(value);

function getText(value: unknown, field: string, limit = 160): string | null {
  if (!isRecord(value) || typeof value[field] !== "string") return null;
  const text = value[field].trim();
  return text.length > 0 && text.length <= limit ? text : null;
}

function getChatMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 30) return null;

  const messages: ChatMessage[] = [];
  let totalLength = 0;
  for (const item of value) {
    if (!isRecord(item) || (item.role !== "user" && item.role !== "assistant")) return null;
    if (typeof item.content !== "string" || !item.content.trim() || item.content.length > 6000) return null;
    totalLength += item.content.length;
    if (totalLength > 18000) return null;
    messages.push({ role: item.role, content: item.content.trim() });
  }
  return messages;
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const requestHosts = [
      request.headers.get("x-forwarded-host"),
      request.headers.get("host"),
    ].filter((host): host is string => Boolean(host)).map((host) => host.toLowerCase());
    return requestHosts.includes(originHost);
  } catch {
    return false;
  }
}

function buildPrompt(action: Exclude<AiAction, "chat">, body: Record<string, unknown>) {
  switch (action) {
    case "research": {
      const ticker = getText(body, "ticker", 15);
      if (!ticker) return null;
      return {
        prompt: `Prepare an educational equity research report for ${ticker.toUpperCase()}. Do not invent current prices, financial ratios, analyst ratings, or targets. If you cannot reliably provide a value, use "Unavailable". Include a concise investment-risk disclaimer.`,
        schema: schemas.research,
      };
    }
    case "strategy": {
      const ticker = getText(body, "ticker", 15);
      const timeframe = getText(body, "timeframe", 16);
      if (!ticker || !timeframe || !["intraday", "weekly", "monthly"].includes(timeframe)) return null;
      return {
        prompt: `Create an educational ${timeframe} trading analysis for ${ticker.toUpperCase()}. Do not claim access to live prices or technical indicators. Use "Unavailable" for price levels that cannot be verified, and include a risk disclaimer.`,
        schema: schemas.strategy,
      };
    }
    case "news": {
      const query = getText(body, "query");
      if (!query) return null;
      return {
        prompt: `Summarize news themes about "${query}". You do not have live web-search access. Do not invent specific headlines, publishers, or publication times; return an empty articles array if you cannot verify articles, and state this limitation in the summary.`,
        schema: schemas.news,
      };
    }
    case "sentiment": {
      const ticker = getText(body, "ticker", 15);
      if (!ticker) return null;
      return {
        prompt: `Provide a general, non-live sentiment assessment for ${ticker.toUpperCase()}. Do not imply you queried social media, current news, analyst reports, or insider filings. Make the limits clear in the summary.`,
        schema: schemas.sentiment,
      };
    }
    case "risk": {
      const query = getText(body, "query");
      if (!query) return null;
      return {
        prompt: `Identify general investment and business risks relevant to "${query}". Do not present this as personalized financial advice. Include a concise risk disclaimer.`,
        schema: schemas.risk,
      };
    }
  }
}

function extractText(data: unknown): string {
  if (!isRecord(data) || !Array.isArray(data.candidates)) return "";
  const candidate = data.candidates[0];
  if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) return "";
  const textParts: string[] = [];
  for (const part of candidate.content.parts) {
    if (isRecord(part) && typeof part.text === "string") textParts.push(part.text);
  }
  return textParts.join("").trim();
}

function getGeminiError(status: number): string {
  if (status === 401 || status === 403) return "Gemini rejected the API key. Check GEMINI_API_KEY and that the Gemini API is enabled.";
  if (status === 429) return "Gemini rate limit reached. Try again shortly.";
  return `Gemini API request failed with status ${status}.`;
}

export async function handleGeminiRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Use POST for Gemini requests." }, 405);
  }
  if (!isAllowedOrigin(request)) {
    return jsonResponse({ error: "Requests from this origin are not allowed." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "Request is too large." }, 413);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "Request is too large." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }
  if (!isRecord(body)) {
    return jsonResponse({ error: "Request body must be a JSON object." }, 400);
  }

  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return jsonResponse({ error: "The server is missing GEMINI_API_KEY." }, 500);
  }

  const action = body.action;
  if (!isAiAction(action)) {
    return jsonResponse({ error: "Unsupported AI action." }, 400);
  }

  const isChat = action === "chat";
  const chatMessages = isChat ? getChatMessages(body.messages) : null;
  if (isChat && !chatMessages) {
    return jsonResponse({ error: "Chat requires 1–30 valid messages with a combined limit of 18,000 characters." }, 400);
  }

  const prompt = isChat ? null : buildPrompt(action, body);
  if (!isChat && !prompt) {
    return jsonResponse({ error: `Invalid or missing input for ${action}.` }, 400);
  }

  const model = env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const method = isChat ? "streamGenerateContent?alt=sse" : "generateContent";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${method}`;
  const systemInstruction = isChat
    ? "You are Stock Assist, an educational financial research assistant. Answer clearly in Markdown. Never claim access to live data unless the user supplies it. Do not provide personalized financial advice; include relevant investment-risk caveats."
    : "You are an educational financial analysis assistant. Follow the user's requested output schema exactly. Do not fabricate financial facts or present generated analysis as personalized investment advice.";
  const contents = isChat
    ? chatMessages?.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })) || []
    : [{ role: "user", parts: [{ text: prompt?.prompt || "" }] }];

  const requestBody: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: isChat
      ? { temperature: 0.6, maxOutputTokens: 2048 }
      : {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseSchema: prompt?.schema,
        },
  };

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    console.error("Gemini API connection failed:", error);
    return jsonResponse({ error: "Could not connect to the Gemini API." }, 502);
  }

  if (!geminiResponse.ok) {
    let errorDetail = "";
    try {
      const errorData: unknown = await geminiResponse.json();
      if (isRecord(errorData) && isRecord(errorData.error) && typeof errorData.error.message === "string") {
        errorDetail = errorData.error.message;
      }
    } catch {
      // ignore json parse failure
    }
    console.error("Gemini API returned status:", geminiResponse.status, errorDetail ? `- ${errorDetail}` : "");
    const status = geminiResponse.status === 429 ? 429 : 502;
    return jsonResponse({ error: errorDetail || getGeminiError(geminiResponse.status) }, status);
  }

  if (isChat) {
    if (!geminiResponse.body) {
      return jsonResponse({ error: "Gemini returned an empty chat response." }, 502);
    }
    return new Response(geminiResponse.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  let responseData: unknown;
  try {
    responseData = await geminiResponse.json();
  } catch {
    return jsonResponse({ error: "Gemini returned an invalid response." }, 502);
  }

  const text = extractText(responseData);
  if (!text) {
    return jsonResponse({ error: "Gemini returned no generated content." }, 502);
  }

  try {
    const result: unknown = JSON.parse(text);
    if (!isRecord(result)) return jsonResponse({ error: "Gemini returned an invalid structured response." }, 502);
    return jsonResponse(result);
  } catch {
    return jsonResponse({ error: "Gemini returned invalid JSON. Please retry." }, 502);
  }
}
