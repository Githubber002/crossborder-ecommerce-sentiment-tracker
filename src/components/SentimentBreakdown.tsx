// 📊 Sentiment Breakdown — clean progress bars
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

function Bar({ label, percent, colorClass, delay }: {
  label: string; percent: number; colorClass: string; delay: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
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
      className="rounded-lg border border-border bg-card p-5"
    >
      <h3 className="mb-1 font-display text-lg font-bold text-foreground">News Breakdown</h3>
      <p className="mb-4 text-xs text-muted-foreground">{breakdown.total} articles analyzed</p>

      <div className="space-y-3">
        <Bar label="😊 Positive" percent={breakdown.positivePercent} colorClass="bg-sentiment-positive" delay={0.4} />
        <Bar label="😠 Negative" percent={breakdown.negativePercent} colorClass="bg-sentiment-negative" delay={0.5} />
        <Bar label="😐 Neutral" percent={breakdown.neutralPercent} colorClass="bg-sentiment-neutral" delay={0.6} />
      </div>
    </motion.div>
  );
}
