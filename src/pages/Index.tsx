// 🌏📊 Crossborder E-commerce Sentiment Tracker
// Powered by NewsData.io + Perplexity AI
// Built for crossborderalex ✨

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Globe, Zap } from "lucide-react";
import { SentimentGauge } from "@/components/SentimentGauge";
import { SentimentBreakdownPanel } from "@/components/SentimentBreakdown";
import { HeadlinesFeed } from "@/components/HeadlinesFeed";
import { AiInsightsPanel } from "@/components/AiInsightsPanel";
import { supabase } from "@/integrations/supabase/client";

interface SentimentData {
  score: number;
  label: string;
  mood: string;
  newsScore: number;
  aiScore: number;
  aiSummary: string;
  aiInsights: string[];
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    positivePercent: number;
    negativePercent: number;
    neutralPercent: number;
  };
  articles: Array<{
    title: string;
    description: string;
    source: string;
    url: string;
    sentiment: "positive" | "negative" | "neutral";
    score: number;
    pubDate: string;
  }>;
  timestamp: string;
}

const CACHE_KEY = "crossborder_sentiment_cache";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachedData(): SentimentData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, cachedAt } = JSON.parse(cached);
    if (Date.now() - cachedAt < CACHE_DURATION_MS) return data;
  } catch { /* no cache */ }
  return null;
}

function setCachedData(data: SentimentData) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
}

const Index = () => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSentiment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("sentiment-tracker");
      if (fnError) throw fnError;
      if (result.error) throw new Error(result.error);
      setData(result);
      setCachedData(result);
    } catch (e: any) {
      setError(e.message || "Failed to fetch sentiment data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-load: use cache if fresh, otherwise fetch
  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      setData(cached);
    } else {
      fetchSentiment();
    }
  }, [fetchSentiment]);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="scanline pointer-events-none fixed inset-0 z-10" />

      <div className="relative z-20 mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Daily Update
            </span>
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground text-glow-primary md:text-5xl">
            Crossborder E-commerce Sentiment Tracker
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Amsterdam HQ · {new Date().toLocaleDateString("en-NL", {
              timeZone: "Europe/Amsterdam", weekday: "long", year: "numeric", month: "long", day: "numeric"
            })}
          </p>
          <div className="mt-1 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> Powered by NewsData.io + Perplexity AI</span>
          </div>
        </motion.header>

        {/* Loading state */}
        {isLoading && !data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <RefreshCw className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 font-display text-lg text-foreground">Scanning global commerce signals...</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">NewsData.io + Perplexity AI analyzing sentiment</p>
          </motion.div>
        )}

        {/* Error */}
        {error && !data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="font-mono text-sm text-destructive">🚨 {error}</p>
            <button onClick={fetchSentiment} className="mt-2 font-mono text-xs text-muted-foreground underline hover:text-primary">
              Try again
            </button>
          </motion.div>
        )}

        {/* Dashboard */}
        {data && (
          <div className="space-y-6">
            {/* Gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-xl border border-border bg-card p-8"
            >
              <SentimentGauge score={data.score} label={data.label} mood={data.mood} />
            </motion.div>

            {/* Grid: AI + Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
              <AiInsightsPanel
                summary={data.aiSummary}
                insights={data.aiInsights}
                aiScore={data.aiScore}
                newsScore={data.newsScore}
              />
              <SentimentBreakdownPanel breakdown={data.breakdown} />
            </div>

            {/* Headlines */}
            <HeadlinesFeed articles={data.articles} />

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="font-mono text-xs text-muted-foreground">
                Updated: {new Date(data.timestamp).toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" })}
                {isLoading && " · Refreshing..."}
              </p>
              <button
                onClick={fetchSentiment}
                disabled={isLoading}
                className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
