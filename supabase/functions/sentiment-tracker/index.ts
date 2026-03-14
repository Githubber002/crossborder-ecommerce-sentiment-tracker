// 🌏📊 Crossborder E-commerce Sentiment Engine
// Server-side daily caching — only hits APIs once per 24h
// Sources: NewsData.io, Google News RSS, YouTube RSS, Shopify Blog, Perplexity AI
// Built for crossborderalex ✨

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const QUERY = '"cross-border e-commerce" OR Temu OR Shein OR "global commerce" OR "EU tariffs" OR Rakuten OR Shopee';

const POS_WORDS = ["growth", "surge", "boom", "success", "record", "expand", "profit", "gain", "opportunity", "thrive", "innovation", "partnership", "expansion", "launch", "adoption", "integration", "QRIS", "digital payment", "marketplace", "free trade", "agreement", "opening", "invest", "revenue", "milestone"];
const NEG_WORDS = ["tariff", "ban", "crash", "decline", "loss", "tension", "risk", "war", "sanction", "crackdown", "fine", "penalty", "slowdown", "restriction", "compliance", "de minimis", "customs duty", "trade barrier", "shutdown", "fraud", "counterfeit", "lawsuit", "probe", "investigation", "sustainability", "green deal", "carbon tax", "carbon border", "CBAM", "greenwashing", "ESG", "eco-regulation", "circular economy", "green compliance", "carbon footprint", "digital service tax", "DST", "location fee", "advertising levy", "ad tax", "advertising tax", "levy"];

interface ArticleResult {
  title: string;
  description: string;
  source: string;
  url: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  pubDate: string;
  origin: string; // "newsdata" | "google-news" | "youtube"
}

function classifyText(title: string, description: string): { sentiment: "positive" | "negative" | "neutral"; score: number } {
  const text = `${title} ${description}`.toLowerCase();
  const posCount = POS_WORDS.filter(w => text.includes(w)).length;
  const negCount = NEG_WORDS.filter(w => text.includes(w)).length;
  if (posCount > negCount) return { sentiment: "positive", score: 0.65 + (posCount * 0.03) };
  if (negCount > posCount) return { sentiment: "negative", score: 0.35 - (negCount * 0.03) };
  return { sentiment: "neutral", score: 0.5 };
}

function classifyArticle(article: any): ArticleResult {
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  let score = 0.5;

  if (article.sentiment_stats && typeof article.sentiment_stats === "object") {
    const posProb = article.sentiment_stats.positive || 0;
    if (posProb > 0.6) { sentiment = "positive"; score = posProb; }
    else if (posProb < 0.4) { sentiment = "negative"; score = posProb; }
    else { sentiment = "neutral"; score = posProb; }
  } else if (article.sentiment && ["positive", "negative", "neutral"].includes(article.sentiment.toLowerCase())) {
    sentiment = article.sentiment.toLowerCase();
    const scoreMap: Record<string, number> = { positive: 0.8, negative: 0.2, neutral: 0.5 };
    score = scoreMap[sentiment] ?? 0.5;
  } else {
    const result = classifyText(article.title || "", article.description || "");
    sentiment = result.sentiment;
    score = result.score;
  }

  return {
    title: article.title || "No Title",
    description: article.description || "",
    source: article.source_name || article.source_id || "Unknown",
    url: article.link || "#",
    sentiment,
    score: Math.max(0, Math.min(1, score)),
    pubDate: article.pubDate || "",
    origin: "newsdata",
  };
}

async function fetchNewsData(apiKey: string): Promise<ArticleResult[]> {
  try {
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(QUERY)}&language=en&country=nl,de,gb,us,cn`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error("NewsData.io error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return (data.results || []).map(classifyArticle);
  } catch (e) {
    console.error("NewsData.io fetch error:", e);
    return [];
  }
}

async function fetchGoogleNewsRSS(): Promise<ArticleResult[]> {
  try {
    const queries = [
      "cross-border e-commerce",
      "Temu Shein tariffs",
      "global ecommerce trade",
      "Rakuten ecommerce",
      "Shopee cross-border",
    ];
    const allArticles: ArticleResult[] = [];

    for (const q of queries) {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Google News RSS error for query:", q, res.status);
        continue;
      }
      const xml = await res.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      if (!doc) continue;

      const items = doc.querySelectorAll("item");
      for (const item of items) {
        const title = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "#";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const source = item.querySelector("source")?.textContent || "Google News";

        const { sentiment, score } = classifyText(title, "");
        allArticles.push({
          title,
          description: "",
          source,
          url: link,
          sentiment,
          score: Math.max(0, Math.min(1, score)),
          pubDate,
          origin: "google-news",
        });
      }
    }

    // Deduplicate by title similarity
    const seen = new Set<string>();
    return allArticles.filter(a => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (e) {
    console.error("Google News RSS error:", e);
    return [];
  }
}

async function fetchYouTubeRSS(): Promise<ArticleResult[]> {
  try {
    const queries = [
      "cross border ecommerce 2025",
      "Temu Shein trade tariffs",
      "Rakuten Shopee ecommerce",
    ];
    const allArticles: ArticleResult[] = [];

    for (const q of queries) {
      // YouTube RSS search via Invidious or direct feed
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=CAISBAgBEAE%253D`; // Filter: today, relevance
      // Use the RSS feed approach via Google
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?search_query=${encodeURIComponent(q)}`;
      
      // YouTube doesn't have a public RSS search, so we use a workaround via Google News YouTube filter
      const googleYtUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q + " site:youtube.com")}&hl=en&gl=US&ceid=US:en`;
      const res = await fetch(googleYtUrl);
      if (!res.ok) continue;
      
      const xml = await res.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      if (!doc) continue;

      const items = doc.querySelectorAll("item");
      for (const item of items) {
        const title = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "#";
        const pubDate = item.querySelector("pubDate")?.textContent || "";

        const { sentiment, score } = classifyText(title, "");
        allArticles.push({
          title,
          description: "",
          source: "YouTube",
          url: link,
          sentiment,
          score: Math.max(0, Math.min(1, score)),
          pubDate,
          origin: "youtube",
        });
      }
    }

    const seen = new Set<string>();
    return allArticles.filter(a => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (e) {
    console.error("YouTube RSS error:", e);
    return [];
  }
}

async function fetchShopifyBlogRSS(): Promise<ArticleResult[]> {
  try {
    // Shopify's blog covers cross-border commerce, global selling, and e-commerce trends
    const feeds = [
      "https://www.shopify.com/blog/topics/guides.atom",
      "https://www.shopify.com/blog.atom",
    ];
    const allArticles: ArticleResult[] = [];

    for (const feedUrl of feeds) {
      const res = await fetch(feedUrl);
      if (!res.ok) {
        console.error("Shopify blog RSS error:", res.status);
        continue;
      }
      const xml = await res.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      if (!doc) continue;

      const entries = doc.querySelectorAll("entry");
      for (const entry of entries) {
        const title = entry.querySelector("title")?.textContent || "";
        const link = entry.querySelector("link")?.getAttribute("href") || "#";
        const published = entry.querySelector("published")?.textContent || "";
        const summary = entry.querySelector("summary")?.textContent || "";

        // Only include articles relevant to cross-border / international commerce
        const text = `${title} ${summary}`.toLowerCase();
        const relevant = ["cross-border", "international", "global", "tariff", "import", "export", "temu", "shein", "alibaba", "rakuten", "shopee", "dropship", "ecommerce", "e-commerce", "sell online", "global commerce"].some(k => text.includes(k));
        if (!relevant) continue;

        const { sentiment, score } = classifyText(title, summary);
        allArticles.push({
          title,
          description: summary.slice(0, 200),
          source: "Shopify Blog",
          url: link,
          sentiment,
          score: Math.max(0, Math.min(1, score)),
          pubDate: published,
          origin: "shopify",
        });
      }
    }

    const seen = new Set<string>();
    return allArticles.filter(a => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);
  } catch (e) {
    console.error("Shopify blog RSS error:", e);
    return [];
  }
}

async function fetchPerplexityAnalysis(apiKey: string): Promise<{ summary: string; sentimentScore: number; keyInsights: string[]; opportunityAdjustment: number }> {
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a cross-border e-commerce sentiment analyst. Respond ONLY with valid JSON, no markdown." },
          { role: "user", content: `Analyze the current sentiment around cross-border e-commerce, global retail, Temu, Shein, Alibaba, Rakuten, Shopee, EU tariffs, and international trade. Return JSON: {"summary": "2-3 sentence mood summary", "sentimentScore": 0-100 (0=very negative, 50=neutral, 100=very positive), "keyInsights": ["insight1", "insight2", "insight3"], "opportunityAdjustment": 0-20 (score how much current disruptions create business opportunities for cross-border sellers, e.g. emerging markets opening, innovation gaps, new payment rails like QRIS, platform shifts — 0=no special opportunity, 20=major opportunity window)}` }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });
    if (!res.ok) { console.error("Perplexity error:", res.status); return { summary: "", sentimentScore: 50, keyInsights: [] }; }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || "",
        sentimentScore: typeof parsed.sentimentScore === "number" ? parsed.sentimentScore : 50,
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        opportunityAdjustment: typeof parsed.opportunityAdjustment === "number" ? Math.min(20, Math.max(0, parsed.opportunityAdjustment)) : 10,
      };
    }
    return { summary: content, sentimentScore: 50, keyInsights: [], opportunityAdjustment: 10 };
  } catch (e) {
    console.error("Perplexity error:", e);
    return { summary: "", sentimentScore: 50, keyInsights: [], opportunityAdjustment: 10 };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check for fresh cache (< 24 hours old)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("sentiment_cache")
      .select("data, created_at")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      console.log("Serving cached sentiment data from", cached.created_at);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No fresh cache — fetch fresh data! 🚀
    console.log("Cache expired, fetching fresh sentiment data...");

    const NEWSDATA_KEY = Deno.env.get("NEWSDATA_API_KEY");
    if (!NEWSDATA_KEY) throw new Error("NEWSDATA_API_KEY not configured");
    const PERPLEXITY_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    // Fetch all sources in parallel
    const [newsDataArticles, googleNewsArticles, youtubeArticles, shopifyArticles, perplexity] = await Promise.all([
      fetchNewsData(NEWSDATA_KEY),
      fetchGoogleNewsRSS(),
      fetchYouTubeRSS(),
      fetchShopifyBlogRSS(),
      fetchPerplexityAnalysis(PERPLEXITY_KEY),
    ]);

    // Combine all articles
    const articles = [...newsDataArticles, ...googleNewsArticles, ...youtubeArticles, ...shopifyArticles];
    console.log(`Sources: NewsData(${newsDataArticles.length}), Google News(${googleNewsArticles.length}), YouTube(${youtubeArticles.length}), Shopify(${shopifyArticles.length})`);

    const total = articles.length;
    const posCount = articles.filter(a => a.sentiment === "positive").length;
    const negCount = articles.filter(a => a.sentiment === "negative").length;
    const neuCount = articles.filter(a => a.sentiment === "neutral").length;
    const newsScore = total > 0 ? (articles.reduce((sum, a) => sum + a.score, 0) / total) * 100 : 50;
    const blendedScore = Math.round(newsScore * 0.6 + perplexity.sentimentScore * 0.4);

    let label: string;
    let mood: string;
    if (blendedScore >= 65) { label = "Positive"; mood = "positive"; }
    else if (blendedScore >= 40) { label = "Neutral"; mood = "neutral"; }
    else { label = "Negative"; mood = "negative"; }

    // Source breakdown
    const sourceCounts = {
      newsdata: newsDataArticles.length,
      googleNews: googleNewsArticles.length,
      youtube: youtubeArticles.length,
      shopify: shopifyArticles.length,
    };

    // Opportunity Score: (Negative% * 1.5) + (Neutral% * 0.5) + AI Adjustment (0-20)
    const negPercent = total > 0 ? Math.round((negCount / total) * 100) : 0;
    const neuPercent = total > 0 ? Math.round((neuCount / total) * 100) : 0;
    const posPercent = total > 0 ? Math.round((posCount / total) * 100) : 0;
    const rawOpportunity = (negPercent * 1.5) + (neuPercent * 0.5) + perplexity.opportunityAdjustment;
    const opportunityScore = Math.round(Math.max(0, Math.min(100, rawOpportunity)));

    let opportunityLabel: string;
    if (opportunityScore >= 70) opportunityLabel = "Prime";
    else if (opportunityScore >= 50) opportunityLabel = "High";
    else if (opportunityScore >= 30) opportunityLabel = "Moderate";
    else opportunityLabel = "Low";

    const result = {
      score: blendedScore,
      label,
      mood,
      newsScore: Math.round(newsScore),
      aiScore: perplexity.sentimentScore,
      aiSummary: perplexity.summary,
      aiInsights: perplexity.keyInsights,
      opportunityScore,
      opportunityLabel,
      opportunityAiAdjustment: perplexity.opportunityAdjustment,
      breakdown: {
        positive: posCount, negative: negCount, neutral: neuCount, total,
        positivePercent: posPercent,
        negativePercent: negPercent,
        neutralPercent: neuPercent,
      },
      sourceCounts,
      articles: articles.slice(0, 12),
      timestamp: new Date().toISOString(),
    };

    // Store in cache (service role bypasses RLS)
    await supabase.from("sentiment_cache").insert({ data: result });

    // Clean up old cache entries
    await supabase.from("sentiment_cache").delete().lt("created_at", twentyFourHoursAgo);

    return new Response(JSON.stringify(result), {
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
