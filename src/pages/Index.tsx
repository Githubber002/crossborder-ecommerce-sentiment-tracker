// 🌏📊 Amsterdam Global Commerce Mood Tracker
// Built for crossborderalex — Vibe check activated! ✨

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MoodIndicator } from "@/components/MoodIndicator";
import { SentimentBreakdownPanel } from "@/components/SentimentBreakdown";
import { HeadlinesFeed } from "@/components/HeadlinesFeed";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { processArticles, getDemoData } from "@/lib/sentiment-engine";
import { DashboardData } from "@/types/sentiment";

const QUERY = encodeURIComponent(
  '"cross-border e-commerce" OR "international e-commerce" OR "global commerce" OR ' +
  '"cross border trade" OR "cross-border retail" OR "global supply chain" OR ' +
  '"tariffs e-commerce" OR Temu OR Shein OR "Alibaba global" OR "EU tariffs retail"'
);

const Index = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "live" | "demo">("idle");

  const fetchLive = useCallback(async (apiKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${QUERY}&language=en,nl&country=nl,be,de,fr,gb,us,cn&size=50`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = await res.json();
      if (!json.results?.length) throw new Error("No articles found for this query");
      setData(processArticles(json.results));
      setMode("live");
      localStorage.setItem("crossborderalex_apikey", apiKey);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDemo = useCallback(() => {
    setData(getDemoData());
    setMode("demo");
    setError(null);
  }, []);

  return (
    <div className="scanline relative min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header — Amsterdam vibes 🇳🇱 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground text-glow-primary md:text-4xl">
            Amsterdam Global Commerce Mood Tracker 🌏📊
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            crossborderalex · {new Date().toLocaleDateString("en-NL", { timeZone: "Europe/Amsterdam", weekday: "long", year: "numeric", month: "long", day: "numeric" })} CET
          </p>
        </motion.header>

        {/* Controls */}
        {!data && (
          <div className="space-y-4">
            <ApiKeyInput onSubmit={fetchLive} isLoading={isLoading} />
            <div className="text-center">
              <button onClick={loadDemo} className="font-mono text-sm text-muted-foreground underline transition-colors hover:text-primary">
                or try with demo data →
              </button>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center font-mono text-sm text-destructive">
                🚨 {error}
              </motion.p>
            )}
          </div>
        )}

        {/* Dashboard */}
        {data && (
          <div className="space-y-6">
            {mode === "demo" && (
              <p className="text-center font-mono text-xs text-muted-foreground">
                📋 Showing demo data · Connect your NewsData.io API key for live sentiment
              </p>
            )}

            <MoodIndicator breakdown={data.breakdown} />

            <div className="grid gap-6 md:grid-cols-2">
              <SentimentBreakdownPanel breakdown={data.breakdown} trend={data.trend} />
              <HeadlinesFeed articles={data.articles} />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="font-mono text-xs text-muted-foreground">
                Updated: {data.lastUpdated} · {data.articleCount} articles
              </p>
              <button
                onClick={() => { setData(null); setMode("idle"); }}
                className="font-mono text-xs text-muted-foreground underline transition-colors hover:text-primary"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
