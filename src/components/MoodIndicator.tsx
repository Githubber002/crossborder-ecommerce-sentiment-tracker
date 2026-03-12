// 🌡️ The Big Mood Indicator — HUD style, Persona 5 energy
import { motion } from "framer-motion";
import { SentimentBreakdown } from "@/types/sentiment";

const moodConfig = {
  positive: { emoji: "😊", glowClass: "text-glow-positive", borderClass: "border-glow-positive", colorClass: "text-sentiment-positive", borderColor: "border-sentiment-positive" },
  negative: { emoji: "😠", glowClass: "text-glow-negative", borderClass: "border-glow-negative", colorClass: "text-sentiment-negative", borderColor: "border-sentiment-negative" },
  neutral: { emoji: "😐", glowClass: "text-glow-neutral", borderClass: "border-glow-neutral", colorClass: "text-sentiment-neutral", borderColor: "border-sentiment-neutral" },
};

export function MoodIndicator({ breakdown }: { breakdown: SentimentBreakdown }) {
  const config = moodConfig[breakdown.overallMood];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative rounded-lg border-2 ${config.borderColor} ${config.borderClass} bg-card p-8 text-center`}
    >
      {/* Scanline overlay for that retro HUD feel */}
      <div className="scanline pointer-events-none absolute inset-0 rounded-lg" />

      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-3 text-7xl"
      >
        {config.emoji}
      </motion.div>

      <h2 className={`font-display text-2xl font-bold tracking-wider ${config.colorClass} ${config.glowClass} md:text-3xl`}>
        {breakdown.moodLabel}
      </h2>

      <p className="mt-2 font-mono text-sm text-muted-foreground">
        Score: {(breakdown.overallScore * 100).toFixed(0)}% · {breakdown.positive + breakdown.negative + breakdown.neutral} articles scanned
      </p>

      {/* Emoji meter — proportional vibes! */}
      <div className="mt-4 flex flex-wrap justify-center gap-1 font-mono text-xs">
        {Array.from({ length: Math.round(breakdown.positivePercent / 10) }).map((_, i) => (
          <span key={`p${i}`}>😊</span>
        ))}
        {Array.from({ length: Math.round(breakdown.negativePercent / 10) }).map((_, i) => (
          <span key={`n${i}`}>😠</span>
        ))}
        {Array.from({ length: Math.round(breakdown.neutralPercent / 10) }).map((_, i) => (
          <span key={`u${i}`}>😐</span>
        ))}
      </div>
    </motion.div>
  );
}
