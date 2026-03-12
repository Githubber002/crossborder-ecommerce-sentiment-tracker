// 🌏📊 Crossborder E-commerce Sentiment Tracker
// Server-side cached, refreshes once per day
// Built for crossborderalex ✨

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { SentimentGauge } from "@/components/SentimentGauge";
import { OpportunityGauge } from "@/components/OpportunityGauge";
import { SentimentBreakdownPanel } from "@/components/SentimentBreakdown";
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
        {/* Header */}
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
            Updates daily
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
            {/* Gauge */}
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

            {/* Last updated */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(data.timestamp).toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" })}
              </p>
            </div>
          </div>
        )}

        {/* Methodology */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 border-t border-border pt-6"
        >
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">How is this calculated?</h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This sentiment score is generated daily by combining multiple sources. News articles about cross-border e-commerce, global trade, and platforms like Temu, Shein, Alibaba, Rakuten, and Shopee are collected from NewsData.io, Google News, YouTube, and Shopify Blog, then classified as positive, negative, or neutral using cross-border specific keywords (e.g. "expansion", "QRIS", "free trade" = positive; "tariff", "trade barrier", "de minimis" = negative). Perplexity AI independently analyzes the current state of the industry. The final score blends all signals (60% aggregated news, 40% AI analysis) into a single 0–100 index.
          </p>
        </motion.div>

        {/* Release Notes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 border-t border-border pt-6"
        >
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Release Notes</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li><span className="font-medium text-foreground">v1.5</span> — Enhanced keyword classification with cross-border specific terms (QRIS, digital payments, trade barriers, de minimis)</li>
            <li><span className="font-medium text-foreground">v1.4</span> — Added Rakuten & Shopee coverage for broader global sentiment</li>
            <li><span className="font-medium text-foreground">v1.3</span> — Added Shopify Blog as sentiment source for deeper e-commerce coverage</li>
            <li><span className="font-medium text-foreground">v1.2</span> — Added Google News & YouTube as free sources for broader coverage</li>
            <li><span className="font-medium text-foreground">v1.1</span> — Added AI analysis via Perplexity, sentiment gauge & breakdown panel</li>
            <li><span className="font-medium text-foreground">v1.0</span> — Initial launch with NewsData.io sentiment tracking</li>
          </ul>
        </motion.div>

        {/* Footer */}
        <div className="mt-6 border-t border-border pt-6 pb-8 text-center">
          <a
            href="https://www.crossborderalex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
          >
            Crossborder E-commerce Sentiment Tracker by Crossborder Alex
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
