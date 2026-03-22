import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker, timeframe } = await req.json();
    if (!ticker) throw new Error("Ticker is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a quantitative trading strategist. Generate a trading strategy for the given stock and timeframe. Return ONLY valid JSON:
{
  "ticker": "TICKER",
  "timeframe": "intraday|weekly|monthly",
  "signal": "BUY|SELL|HOLD",
  "confidence": 75,
  "entryPrice": "Suggested entry",
  "targetPrice": "Price target",
  "stopLoss": "Stop loss level",
  "rationale": "2-3 sentence explanation",
  "technicalIndicators": [
    {"name": "RSI", "value": "65", "interpretation": "Neutral-bullish"},
    {"name": "MACD", "value": "Bullish crossover", "interpretation": "Positive momentum"}
  ],
  "keyLevels": {"support": "price", "resistance": "price"},
  "riskReward": "1:2.5"
}`
          },
          { role: "user", content: `Generate a ${timeframe || 'intraday'} trading strategy for ${ticker.toUpperCase()}` }
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const strategy = JSON.parse(content);

    return new Response(JSON.stringify(strategy), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-strategy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
