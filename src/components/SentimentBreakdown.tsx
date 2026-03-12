// 📊 Sentiment Breakdown — ASCII progress bars, terminal style
import { motion } from "framer-motion";
import { SentimentBreakdown } from "@/types/sentiment";

function ProgressBar({ label, emoji, percent, colorClass, delay }: {
  label: string; emoji: string; percent: number; colorClass: string; delay: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between font-mono text-sm">
        <span className={colorClass}>{emoji} {label}</span>
        <span className="text-muted-foreground">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-sm bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className={`h-full rounded-sm ${colorClass === "text-sentiment-positive" ? "bg-sentiment-positive" : colorClass === "text-sentiment-negative" ? "bg-sentiment-negative" : "bg-sentiment-neutral"}`}
        />
      </div>
    </div>
  );
}

export function SentimentBreakdownPanel({ breakdown, trend }: {
  breakdown: SentimentBreakdown; trend: "improving" | "declining" | "stable";
}) {
  const trendConfig = {
    improving: { icon: "↑", label: "Improving!", colorClass: "text-sentiment-positive" },
    declining: { icon: "↓", label: "Tension Rising!", colorClass: "text-sentiment-negative" },
    stable: { icon: "→", label: "Stable", colorClass: "text-sentiment-neutral" },
  };
  const t = trendConfig[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
        Sentiment Breakdown
      </h3>

      <div className="space-y-4">
        <ProgressBar label="Positive" emoji="😊" percent={breakdown.positivePercent} colorClass="text-sentiment-positive" delay={0.4} />
        <ProgressBar label="Negative" emoji="😠" percent={breakdown.negativePercent} colorClass="text-sentiment-negative" delay={0.5} />
        <ProgressBar label="Neutral" emoji="😐" percent={breakdown.neutralPercent} colorClass="text-sentiment-neutral" delay={0.6} />
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-md bg-secondary px-4 py-2">
        <span className={`font-display text-xl font-bold ${t.colorClass}`}>{t.icon}</span>
        <span className="font-mono text-sm text-secondary-foreground">
          Trend: <span className={`font-semibold ${t.colorClass}`}>{t.label}</span>
        </span>
      </div>
    </motion.div>
  );
}
