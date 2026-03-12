// 🌏📊 Crossborder E-commerce Sentiment Tracker
// Server-side cached, refreshes once per day
// Built for crossborderalex ✨

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
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

const Index = () => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSentiment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("sentiment-tracker");
      if (fnError) throw fnError;
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to fetch sentiment data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSentiment();
  }, [fetchSentiment]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header — Substack-style clean editorial */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10 border-b border-border pb-6 text-center"
        >
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Crossborder E-commerce Sentiment Tracker
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            by Crossborder Alex · {new Date().toLocaleDateString("en-NL", {
              timeZone: "Europe/Amsterdam", month: "long", day: "numeric", year: "numeric"
            })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Powered by NewsData.io + Perplexity AI · Updates daily
          </p>
        </motion.header>

        {/* Loading */}
        {isLoading && !data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 font-display text-lg text-foreground">Loading sentiment data...</p>
          </motion.div>
        )}

        {/* Error */}
        {error && !data && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={fetchSentiment} className="mt-2 text-xs text-muted-foreground underline hover:text-foreground">
              Try again
            </button>
          </div>
        )}

        {/* Dashboard */}
        {data && (
          <div className="space-y-8">
            {/* Gauge — every visitor sees the animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border border-border bg-card px-6 py-8"
            >
              <SentimentGauge score={data.score} label={data.label} mood={data.mood} />
            </motion.div>

            {/* AI Insights */}
            <AiInsightsPanel
              summary={data.aiSummary}
              insights={data.aiInsights}
              aiScore={data.aiScore}
              newsScore={data.newsScore}
            />

            {/* Breakdown */}
            <SentimentBreakdownPanel breakdown={data.breakdown} />

            {/* Headlines */}
            <HeadlinesFeed articles={data.articles} />

            {/* Footer */}
            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(data.timestamp).toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
