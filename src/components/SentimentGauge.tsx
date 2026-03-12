// 🎯 Sentiment Bar — diverging horizontal bar with color gradient
import { motion } from "framer-motion";

interface GaugeProps {
  score: number;
  label: string;
  mood: string;
}

export function SentimentGauge({ score, label, mood }: GaugeProps) {
  const moodColors: Record<string, string> = {
    positive: "text-sentiment-positive",
    negative: "text-sentiment-negative",
    neutral: "text-sentiment-neutral",
  };

  // Diverging bar: score 0-100 mapped to a gradient from red → amber → green
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score + Label */}
      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`font-display text-5xl font-bold ${moodColors[mood] || "text-foreground"}`}
        >
          {score}
        </motion.span>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`mt-1 text-base font-medium tracking-wide ${moodColors[mood] || "text-foreground"}`}
        >
          {label}
        </motion.p>
      </div>

      {/* Diverging gradient bar */}
      <div className="w-full max-w-md">
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
          {/* Full gradient background */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(to right, hsl(0, 65%, 50%), hsl(25, 75%, 55%), hsl(38, 80%, 52%), hsl(100, 45%, 48%), hsl(152, 55%, 42%))",
            }}
          />
          {/* Mask: covers unfilled portion from the right */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${100 - score}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="absolute right-0 top-0 h-full rounded-r-full bg-secondary"
          />
        </div>

        {/* Scale labels */}
        <div className="mt-1.5 flex justify-between text-[10px] font-medium">
          <span className="text-sentiment-negative">Negative</span>
          <span className="text-sentiment-neutral">Neutral</span>
          <span className="text-sentiment-positive">Positive</span>
        </div>
      </div>
    </div>
  );
}
