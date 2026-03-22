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
            content: `You are a senior equity research analyst. Given a stock ticker, provide a comprehensive research report in the following JSON format. Be specific with real data and current analysis.
Return ONLY valid JSON with this structure:
{
  "company": "Company Name",
  "ticker": "TICKER",
  "sector": "Sector",
  "price": "Current approximate price",
  "marketCap": "Market cap",
  "peRatio": "P/E ratio",
  "summary": "2-3 sentence executive summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "risks": ["risk1", "risk2", "risk3"],
  "catalysts": ["catalyst1", "catalyst2"],
  "analystConsensus": "Buy/Hold/Sell",
  "priceTarget": "Average analyst price target",
  "outlook": "3-4 sentence forward-looking analysis"
}`
          },
          { role: "user", content: `Provide a research report for ${ticker.toUpperCase()}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "stock_research_report",
              description: "Return a structured stock research report",
              parameters: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  ticker: { type: "string" },
                  sector: { type: "string" },
                  price: { type: "string" },
                  marketCap: { type: "string" },
                  peRatio: { type: "string" },
                  summary: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  risks: { type: "array", items: { type: "string" } },
                  catalysts: { type: "array", items: { type: "string" } },
                  analystConsensus: { type: "string" },
                  priceTarget: { type: "string" },
                  outlook: { type: "string" }
                },
                required: ["company", "ticker", "sector", "summary", "strengths", "risks", "outlook"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "stock_research_report" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const report = toolCall ? JSON.parse(toolCall.function.arguments) : JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-research error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
