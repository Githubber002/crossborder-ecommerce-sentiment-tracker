// 🎯 Sentiment Gauge — clean editorial style with animated needle
import { motion } from "framer-motion";

interface GaugeProps {
  score: number;
  label: string;
  mood: string;
}

export function SentimentGauge({ score, label, mood }: GaugeProps) {
  const rotation = -90 + (score / 100) * 180;

  const moodColors: Record<string, string> = {
    positive: "text-sentiment-positive",
    negative: "text-sentiment-negative",
    neutral: "text-sentiment-neutral",
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-72 md:h-52 md:w-96">
        <svg viewBox="0 0 300 170" className="h-full w-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 65%, 50%)" />
              <stop offset="25%" stopColor="hsl(25, 75%, 55%)" />
              <stop offset="50%" stopColor="hsl(38, 80%, 52%)" />
              <stop offset="75%" stopColor="hsl(100, 45%, 48%)" />
              <stop offset="100%" stopColor="hsl(152, 55%, 42%)" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="hsl(0, 0%, 92%)" strokeWidth="22" strokeLinecap="round" />

          {/* Colored arc */}
          <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="url(#gaugeGradient)" strokeWidth="22" strokeLinecap="round" />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI - (tick / 100) * Math.PI;
            const x1 = 150 + 108 * Math.cos(angle);
            const y1 = 150 - 108 * Math.sin(angle);
            const x2 = 150 + 120 * Math.cos(angle);
            const y2 = 150 - 120 * Math.sin(angle);
            return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(0, 0%, 40%)" strokeWidth="1.5" opacity="0.5" />;
          })}

          {/* Labels */}
          <text x="10" y="148" fill="hsl(0, 65%, 50%)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="start">Negative</text>
          <text x="290" y="148" fill="hsl(152, 55%, 42%)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="end">Positive</text>
          <text x="150" y="28" fill="hsl(38, 80%, 52%)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Neutral</text>

          {/* Needle — animated from left to final position */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1], delay: 0.5 }}
            style={{ transformOrigin: "150px 150px" }}
          >
            <line x1="150" y1="150" x2="150" y2="48" stroke="hsl(0, 0%, 20%)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="150" cy="48" r="4" fill="hsl(0, 0%, 20%)" />
          </motion.g>

          {/* Center dot */}
          <circle cx="150" cy="150" r="7" fill="hsl(0, 0%, 100%)" stroke="hsl(0, 0%, 20%)" strokeWidth="2" />
          <circle cx="150" cy="150" r="3" fill="hsl(0, 0%, 20%)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="-mt-2 text-center"
      >
        <span className={`font-display text-5xl font-bold ${moodColors[mood] || "text-foreground"}`}>
          {score}
        </span>
        <p className={`mt-1 text-base font-medium tracking-wide ${moodColors[mood] || "text-foreground"}`}>
          {label}
        </p>
      </motion.div>
    </div>
  );
}
