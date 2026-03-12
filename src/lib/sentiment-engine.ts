// 🔮 Sentiment analysis engine — Vibe check activated! ✨
// Processes NewsData.io articles into beautiful sentiment data

import { ArticleSentiment, DashboardData, SentimentBreakdown, SentimentLabel } from "@/types/sentiment";

const STORAGE_KEY = "crossborderalex_last_mood";

// Amsterdam retail energy incoming! 🇳🇱
function classifyArticle(article: any): ArticleSentiment {
  let sentiment: SentimentLabel = "neutral";
  let score = 0.5;

  // Priority 1: Use NewsData.io's built-in sentiment_stats
  if (article.sentiment_stats && typeof article.sentiment_stats === "object") {
    const posProb = article.sentiment_stats.positive || 0;
    if (posProb > 0.6) { sentiment = "positive"; score = posProb; }
    else if (posProb < 0.4) { sentiment = "negative"; score = posProb; }
    else { sentiment = "neutral"; score = posProb; }
  }
  // Priority 2: Direct sentiment field
  else if (article.sentiment) {
    sentiment = article.sentiment.toLowerCase() as SentimentLabel;
    const scoreMap: Record<string, number> = { positive: 0.8, negative: 0.2, neutral: 0.5 };
    score = scoreMap[sentiment] ?? 0.5;
  }
  // Fallback: Simple keyword-based heuristic (no TextBlob in browser!)
  else {
    const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();
    const posWords = ["growth", "surge", "boom", "success", "record", "expand", "profit", "gain", "opportunity", "thrive"];
    const negWords = ["tariff", "ban", "crash", "decline", "loss", "tension", "risk", "war", "sanction", "crackdown"];
    const posCount = posWords.filter(w => text.includes(w)).length;
    const negCount = negWords.filter(w => text.includes(w)).length;
    if (posCount > negCount) { sentiment = "positive"; score = 0.7; }
    else if (negCount > posCount) { sentiment = "negative"; score = 0.3; }
    else { sentiment = "neutral"; score = 0.5; }
  }

  return {
    title: article.title || "No Title",
    description: article.description || "",
    source: article.source_name || article.source_id || "Unknown",
    url: article.link || "#",
    sentiment,
    score,
    pubDate: article.pubDate || "",
  };
}

function getBreakdown(articles: ArticleSentiment[]): SentimentBreakdown {
  const total = articles.length;
  const pos = articles.filter(a => a.sentiment === "positive").length;
  const neg = articles.filter(a => a.sentiment === "negative").length;
  const neu = articles.filter(a => a.sentiment === "neutral").length;

  const posPct = total > 0 ? (pos / total) * 100 : 0;
  const negPct = total > 0 ? (neg / total) * 100 : 0;
  const neuPct = total > 0 ? (neu / total) * 100 : 0;
  const overallScore = total > 0 ? articles.reduce((sum, a) => sum + a.score, 0) / total : 0.5;

  let overallMood: SentimentLabel = "neutral";
  let moodLabel = "⚖️ MIXED & CAUTIOUS ⚖️";
  if (posPct > 55 && overallScore > 0.6) {
    overallMood = "positive";
    moodLabel = "✨ HUGE POSITIVE VIBES ✨";
  } else if (negPct > 55 && overallScore < 0.4) {
    overallMood = "negative";
    moodLabel = "📉 TENSION & HEADWINDS 📉";
  }

  return {
    positive: pos, negative: neg, neutral: neu,
    positivePercent: posPct, negativePercent: negPct, neutralPercent: neuPct,
    overallScore, overallMood, moodLabel,
  };
}

function getTrend(currentScore: number): "improving" | "declining" | "stable" {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prev = JSON.parse(stored).overallScore;
      if (currentScore > prev + 0.05) return "improving";
      if (currentScore < prev - 0.05) return "declining";
    }
  } catch { /* No history yet */ }
  return "stable";
}

function saveMood(score: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ overallScore: score, timestamp: new Date().toISOString() }));
}

export function processArticles(rawArticles: any[]): DashboardData {
  const articles = rawArticles.map(classifyArticle);
  const breakdown = getBreakdown(articles);
  const trend = getTrend(breakdown.overallScore);

  // Save for next trend comparison
  saveMood(breakdown.overallScore);

  return {
    articles,
    breakdown,
    trend,
    lastUpdated: new Date().toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" }),
    articleCount: articles.length,
  };
}

// Demo data for when no API key is set — keep the vibes alive! 🎭
export function getDemoData(): DashboardData {
  const demoArticles: ArticleSentiment[] = [
    { title: "Temu expands European warehouse network to speed up deliveries", description: "Chinese e-commerce giant Temu opens new fulfillment centers across the Netherlands and Belgium", source: "Reuters", url: "#", sentiment: "positive", score: 0.82, pubDate: "2026-03-12" },
    { title: "EU proposes new tariffs on low-value cross-border parcels", description: "European Commission targets sub-€150 shipments in latest trade policy update", source: "Financial Times", url: "#", sentiment: "negative", score: 0.25, pubDate: "2026-03-12" },
    { title: "Shein faces mounting pressure over sustainability standards", description: "Fast fashion platform under scrutiny as EU tightens environmental regulations", source: "The Guardian", url: "#", sentiment: "negative", score: 0.18, pubDate: "2026-03-11" },
    { title: "Cross-border e-commerce grows 23% in Q1 2026", description: "Global online retail continues strong trajectory despite trade uncertainties", source: "eMarketer", url: "#", sentiment: "positive", score: 0.88, pubDate: "2026-03-11" },
    { title: "Alibaba International reports record Singles' Day performance", description: "AliExpress and Lazada see surge in European market orders", source: "Bloomberg", url: "#", sentiment: "positive", score: 0.79, pubDate: "2026-03-10" },
    { title: "Netherlands leads EU in cross-border logistics innovation", description: "Amsterdam and Rotterdam hubs see increased investment in smart fulfillment tech", source: "DutchNews", url: "#", sentiment: "positive", score: 0.85, pubDate: "2026-03-10" },
    { title: "US-China trade tensions impact global supply chain sentiment", description: "New round of proposed tariffs creates uncertainty for international retailers", source: "CNBC", url: "#", sentiment: "negative", score: 0.22, pubDate: "2026-03-09" },
    { title: "European consumers increasingly shop cross-border for deals", description: "Survey reveals 62% of EU shoppers have purchased from foreign online stores", source: "Eurostat", url: "#", sentiment: "positive", score: 0.75, pubDate: "2026-03-09" },
  ];

  const breakdown = getBreakdown(demoArticles);
  return {
    articles: demoArticles,
    breakdown,
    trend: "improving",
    lastUpdated: new Date().toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" }),
    articleCount: demoArticles.length,
  };
}
