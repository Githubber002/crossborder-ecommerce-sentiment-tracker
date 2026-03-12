// 📊 Sentiment Breakdown — progress bars
import { motion } from "framer-motion";

interface BreakdownProps {
  positive: number;
  negative: number;
  neutral: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  total: number;
}

function Bar({ label, emoji, percent, colorClass, bgClass, delay }: {
  label: string; emoji: string; percent: number; colorClass: string; bgClass: string; delay: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between font-mono text-sm">
        <span className={colorClass}>{emoji} {label}</span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className={`h-full rounded-full ${bgClass}`}
        />
      </div>
    </div>
  );
}

export function SentimentBreakdownPanel({ breakdown }: { breakdown: BreakdownProps }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
        News Breakdown
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">{breakdown.total} articles analyzed</p>

      <div className="space-y-3">
        <Bar label="Positive" emoji="😊" percent={breakdown.positivePercent} colorClass="text-sentiment-positive" bgClass="bg-sentiment-positive" delay={0.4} />
        <Bar label="Negative" emoji="😠" percent={breakdown.negativePercent} colorClass="text-sentiment-negative" bgClass="bg-sentiment-negative" delay={0.5} />
        <Bar label="Neutral" emoji="😐" percent={breakdown.neutralPercent} colorClass="text-sentiment-neutral" bgClass="bg-sentiment-neutral" delay={0.6} />
      </div>
    </motion.div>
  );
}
