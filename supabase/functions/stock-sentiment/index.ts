import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker } = await req.json();
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
            content: `You are a market sentiment analyst. Analyze sentiment for the given stock across multiple sources. Return ONLY valid JSON:
{
  "ticker": "TICKER",
  "overallSentiment": "Bullish|Bearish|Neutral",
  "sentimentScore": 72,
  "sources": [
    {"name": "Social Media", "sentiment": "Bullish", "score": 78, "highlights": ["Key point 1", "Key point 2"]},
    {"name": "News Coverage", "sentiment": "Neutral", "score": 55, "highlights": ["Key point 1"]},
    {"name": "Analyst Reports", "sentiment": "Bullish", "score": 80, "highlights": ["Key point 1"]},
    {"name": "Insider Activity", "sentiment": "Neutral", "score": 50, "highlights": ["Key point 1"]}
  ],
  "trendingTopics": ["topic1", "topic2", "topic3"],
  "summary": "2-3 sentence summary of overall sentiment landscape"
}`
          },
          { role: "user", content: `Analyze market sentiment for ${ticker.toUpperCase()}` }
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
    const sentiment = JSON.parse(content);

    return new Response(JSON.stringify(sentiment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-sentiment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
