// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Query is required");

    // @ts-ignore - Deno API
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
              content: `You are a financial news analyst. Synthesize the latest news for the given company or topic. Return ONLY valid JSON:
{
  "topic": "Topic name",
  "summary": "2-3 sentence overview of current news landscape",
  "articles": [
    {
      "title": "Article headline",
      "source": "News source",
      "timeAgo": "2 hours ago",
      "summary": "1-2 sentence summary",
      "sentiment": "positive|negative|neutral",
      "impact": "high|medium|low"
    }
  ],
  "overallSentiment": "positive|negative|neutral",
  "keyTakeaway": "One sentence key takeaway for investors"
}
Generate 5-6 realistic, current-sounding news articles.`,
            },
            {
              role: "user",
              content: `Synthesize the latest news for: ${query}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (status === 402)
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const news = JSON.parse(content);

    return new Response(JSON.stringify(news), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-news error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
