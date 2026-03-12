// 🤖 AI Insights Panel — clean editorial style
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
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-display text-lg font-bold text-foreground">AI Analysis</h3>
      </div>

      {summary && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{summary}</p>
      )}

      {insights.length > 0 && (
        <ul className="mb-4 space-y-2">
          {insights.map((insight, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-start gap-2 text-sm text-secondary-foreground"
            >
              <span className="mt-0.5 text-muted-foreground">•</span>
              <span>{insight}</span>
            </motion.li>
          ))}
        </ul>
      )}

      <div className="flex gap-6 border-t border-border pt-3">
        <div>
          <p className="font-mono text-xl font-bold text-foreground">{newsScore}</p>
          <p className="text-xs text-muted-foreground">News Score</p>
        </div>
        <div>
          <p className="font-mono text-xl font-bold text-foreground">{aiScore}</p>
          <p className="text-xs text-muted-foreground">AI Score</p>
        </div>
      </div>
    </motion.div>
  );
}
