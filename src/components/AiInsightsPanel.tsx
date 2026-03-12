// 🤖 AI Insights Panel — Perplexity-powered analysis
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AiInsightsProps {
  summary: string;
  insights: string[];
  aiScore: number;
  newsScore: number;
}

export function AiInsightsPanel({ summary, insights, aiScore, newsScore }: AiInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">AI Analysis</h3>
      </div>

      {summary && (
        <p className="mb-4 text-sm leading-relaxed text-secondary-foreground">
          {summary}
        </p>
      )}

      {insights.length > 0 && (
        <div className="mb-4 space-y-2">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-start gap-2 rounded-md bg-secondary/50 px-3 py-2"
            >
              <span className="mt-0.5 text-primary">▸</span>
              <span className="text-sm text-secondary-foreground">{insight}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-4 border-t border-border pt-3">
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-foreground">{newsScore}</p>
          <p className="text-xs text-muted-foreground">News Score</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-primary">{aiScore}</p>
          <p className="text-xs text-muted-foreground">AI Score</p>
        </div>
      </div>
    </motion.div>
  );
}
