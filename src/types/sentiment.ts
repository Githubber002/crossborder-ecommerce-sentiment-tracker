// 🌏 Cross-Border Commerce Sentiment Types
// Amsterdam HQ vibes incoming! ✨

export type SentimentLabel = "positive" | "negative" | "neutral";

export interface ArticleSentiment {
  title: string;
  description: string;
  source: string;
  url: string;
  sentiment: SentimentLabel;
  score: number;
  pubDate: string;
}

export interface SentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  overallScore: number;
  overallMood: SentimentLabel;
  moodLabel: string;
}

export interface DashboardData {
  articles: ArticleSentiment[];
  breakdown: SentimentBreakdown;
  trend: "improving" | "declining" | "stable";
  lastUpdated: string;
  articleCount: number;
}
