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
  opportunityScore: number;
  opportunityLabel: string;
  opportunityAiAdjustment: number;
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
            Global Crossborder E-commerce Sentiment Tracker
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

            {/* Opportunity Radar */}
            {data.opportunityScore != null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-lg border border-border bg-card px-6 py-8"
              >
                <h3 className="mb-4 text-center font-display text-lg font-semibold text-foreground">
                  Opportunity Radar
                </h3>
                <OpportunityGauge score={data.opportunityScore} label={data.opportunityLabel} />
                <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground max-w-sm mx-auto">
                  When the market is disrupted — tariffs, trade barriers, platform shifts — new opportunities open up for cross-border sellers who move fast. The more negative the news, the bigger the window. AI scans for emerging trends like new markets and payment innovations to fine-tune the score.
                </p>
              </motion.div>
            )}
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
            This sentiment score is generated daily by combining multiple sources. News articles about cross-border e-commerce, global trade, and platforms like Temu, Shein, Alibaba, Rakuten, and Shopee are collected from NewsData.io, Google News, YouTube, and Shopify Blog, then classified as positive, negative, or neutral using cross-border specific keywords (e.g. "expansion", "QRIS", "free trade" = positive; "tariff", "trade barrier", "de minimis", "CBAM", "carbon tax", "greenwashing" = negative). Sustainability and green regulation terms are classified as negative because they typically represent added compliance costs and trade friction for cross-border sellers. Perplexity AI independently analyzes the current state of the industry. The final score blends all signals (60% aggregated news, 40% AI analysis) into a single 0–100 index.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            The <strong className="text-foreground">Opportunity Radar</strong> measures how much current market disruptions create business openings for cross-border sellers. It uses the formula: (Negative% × 1.5) + (Neutral% × 0.5) + AI Adjustment (0–20). More negatives amplify opportunity (disruption = openings), neutrals add moderate potential, and Perplexity AI provides a 0–20 boost when it detects themes like emerging markets, innovation gaps, or new payment rails.
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
            <li><span className="font-medium text-foreground">v2.1</span> — Added Firehose.com as a live web mention source — real-time brand & keyword monitoring feeds into sentiment analysis</li>
            <li><span className="font-medium text-foreground">v2.0</span> — Entrepreneurial Buzz detection: 40+ opportunity keywords (startup, dropshipping, market entry, blue ocean…) + AI-scored entrepreneurial energy now feed into the Opportunity Radar</li>
            <li><span className="font-medium text-foreground">v1.9</span> — Added Strait of Hormuz, Red Sea/Houthi disruptions, oil & fuel shocks, shipping route closures as negative signals — transport risk coverage</li>
            <li><span className="font-medium text-foreground">v1.8</span> — Added Digital Service Tax (DST), location fees & advertising levies (Austria, France, Italy, Spain, Türkiye, UK) as negative signals</li>
            <li><span className="font-medium text-foreground">v1.7</span> — Sustainability & green regulation terms (CBAM, carbon tax, ESG, greenwashing) classified as negative — added compliance cost reality</li>
            <li><span className="font-medium text-foreground">v1.6</span> — Added Opportunity Radar gauge with weighted disruption formula + AI adjustment</li>
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
