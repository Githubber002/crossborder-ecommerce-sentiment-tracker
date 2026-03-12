// 🌏📊 Cross-Border Commerce Sentiment Engine
// Combines NewsData.io articles + Perplexity AI analysis
// Built for crossborderalex in Amsterdam ✨

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const QUERY = '("cross-border e-commerce" OR "international e-commerce" OR "global commerce" OR "cross border trade" OR "cross-border retail" OR "global supply chain" OR "tariffs e-commerce" OR Temu OR Shein OR "Alibaba global" OR "EU tariffs retail")';

// Positive/negative keyword lists for fallback scoring
const POS_WORDS = ["growth", "surge", "boom", "success", "record", "expand", "profit", "gain", "opportunity", "thrive", "innovation", "partnership"];
const NEG_WORDS = ["tariff", "ban", "crash", "decline", "loss", "tension", "risk", "war", "sanction", "crackdown", "fine", "penalty", "slowdown"];

interface ArticleResult {
  title: string;
  description: string;
  source: string;
  url: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  pubDate: string;
}

function classifyArticle(article: any): ArticleResult {
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  let score = 0.5;

  if (article.sentiment_stats && typeof article.sentiment_stats === "object") {
    const posProb = article.sentiment_stats.positive || 0;
    if (posProb > 0.6) { sentiment = "positive"; score = posProb; }
    else if (posProb < 0.4) { sentiment = "negative"; score = posProb; }
    else { sentiment = "neutral"; score = posProb; }
  } else if (article.sentiment) {
    sentiment = article.sentiment.toLowerCase();
    const scoreMap: Record<string, number> = { positive: 0.8, negative: 0.2, neutral: 0.5 };
    score = scoreMap[sentiment] ?? 0.5;
  } else {
    const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();
    const posCount = POS_WORDS.filter(w => text.includes(w)).length;
    const negCount = NEG_WORDS.filter(w => text.includes(w)).length;
    if (posCount > negCount) { sentiment = "positive"; score = 0.65 + (posCount * 0.03); }
    else if (negCount > posCount) { sentiment = "negative"; score = 0.35 - (negCount * 0.03); }
    else { sentiment = "neutral"; score = 0.5; }
  }

  return {
    title: article.title || "No Title",
    description: article.description || "",
    source: article.source_name || article.source_id || "Unknown",
    url: article.link || "#",
    sentiment,
    score: Math.max(0, Math.min(1, score)),
    pubDate: article.pubDate || "",
  };
}

async function fetchNewsData(apiKey: string): Promise<ArticleResult[]> {
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(QUERY)}&language=en,nl&country=nl,be,de,fr,gb,us,cn&size=50`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("NewsData.io error:", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  return (data.results || []).map(classifyArticle);
}

async function fetchPerplexityAnalysis(apiKey: string): Promise<{ summary: string; sentimentScore: number; keyInsights: string[] }> {
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a cross-border e-commerce sentiment analyst based in Amsterdam. Respond ONLY with valid JSON, no markdown."
          },
          {
            role: "user",
            content: `Analyze the current sentiment around cross-border e-commerce, global retail, Temu, Shein, Alibaba, EU tariffs, and international trade. Return JSON: {"summary": "2-3 sentence mood summary", "sentimentScore": 0-100 (0=extreme fear, 50=neutral, 100=extreme greed/optimism), "keyInsights": ["insight1", "insight2", "insight3"]}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      console.error("Perplexity error:", res.status, await res.text());
      return { summary: "", sentimentScore: 50, keyInsights: [] };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || "",
        sentimentScore: typeof parsed.sentimentScore === "number" ? parsed.sentimentScore : 50,
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      };
    }
    return { summary: content, sentimentScore: 50, keyInsights: [] };
  } catch (e) {
    console.error("Perplexity parse error:", e);
    return { summary: "", sentimentScore: 50, keyInsights: [] };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NEWSDATA_KEY = Deno.env.get("NEWSDATA_API_KEY");
    if (!NEWSDATA_KEY) throw new Error("NEWSDATA_API_KEY not configured");

    const PERPLEXITY_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    // Fetch both sources in parallel — Amsterdam efficiency! 🚀
    const [articles, perplexity] = await Promise.all([
      fetchNewsData(NEWSDATA_KEY),
      fetchPerplexityAnalysis(PERPLEXITY_KEY),
    ]);

    // Calculate news-based score (0-100 scale)
    const total = articles.length;
    const posCount = articles.filter(a => a.sentiment === "positive").length;
    const negCount = articles.filter(a => a.sentiment === "negative").length;
    const neuCount = articles.filter(a => a.sentiment === "neutral").length;

    const newsScore = total > 0
      ? (articles.reduce((sum, a) => sum + a.score, 0) / total) * 100
      : 50;

    // Blend scores: 60% news data, 40% Perplexity AI analysis
    const blendedScore = Math.round(newsScore * 0.6 + perplexity.sentimentScore * 0.4);

    // Determine fear/greed label
    let label: string;
    let mood: string;
    if (blendedScore >= 80) { label = "Extreme Optimism"; mood = "positive"; }
    else if (blendedScore >= 60) { label = "Optimism"; mood = "positive"; }
    else if (blendedScore >= 45) { label = "Neutral"; mood = "neutral"; }
    else if (blendedScore >= 25) { label = "Fear"; mood = "negative"; }
    else { label = "Extreme Fear"; mood = "negative"; }

    const response = {
      score: blendedScore,
      label,
      mood,
      newsScore: Math.round(newsScore),
      aiScore: perplexity.sentimentScore,
      aiSummary: perplexity.summary,
      aiInsights: perplexity.keyInsights,
      breakdown: {
        positive: posCount,
        negative: negCount,
        neutral: neuCount,
        total,
        positivePercent: total > 0 ? Math.round((posCount / total) * 100) : 0,
        negativePercent: total > 0 ? Math.round((negCount / total) * 100) : 0,
        neutralPercent: total > 0 ? Math.round((neuCount / total) * 100) : 0,
      },
      articles: articles.slice(0, 8),
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Sentiment engine error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
