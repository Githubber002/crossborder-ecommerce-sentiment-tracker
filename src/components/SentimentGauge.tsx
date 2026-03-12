// 🎯 Fear & Greed Gauge — Bitcoin sentiment tracker style
// A beautiful semicircle gauge with gradient colors

import { motion } from "framer-motion";

interface GaugeProps {
  score: number; // 0-100
  label: string;
  mood: string;
}

export function SentimentGauge({ score, label, mood }: GaugeProps) {
  // Map 0-100 to -90 to 90 degrees for semicircle
  const rotation = -90 + (score / 100) * 180;

  const moodColors: Record<string, string> = {
    positive: "text-sentiment-positive",
    negative: "text-sentiment-negative",
    neutral: "text-sentiment-neutral",
  };

  return (
    <div className="flex flex-col items-center">
      {/* Gauge SVG */}
      <div className="relative h-48 w-80 md:h-56 md:w-96">
        <svg viewBox="0 0 300 170" className="h-full w-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 75%, 55%)" />
              <stop offset="25%" stopColor="hsl(20, 80%, 55%)" />
              <stop offset="50%" stopColor="hsl(45, 95%, 55%)" />
              <stop offset="75%" stopColor="hsl(90, 60%, 50%)" />
              <stop offset="100%" stopColor="hsl(145, 70%, 50%)" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 30 150 A 120 120 0 0 1 270 150"
            fill="none"
            stroke="hsl(230, 15%, 18%)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d="M 30 150 A 120 120 0 0 1 270 150"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="24"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI - (tick / 100) * Math.PI;
            const innerR = 108;
            const outerR = 118;
            const x1 = 150 + innerR * Math.cos(angle);
            const y1 = 150 - innerR * Math.sin(angle);
            const x2 = 150 + outerR * Math.cos(angle);
            const y2 = 150 - outerR * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(60, 10%, 92%)"
                strokeWidth="2"
                opacity="0.4"
              />
            );
          })}

          {/* Labels */}
          <text x="20" y="165" fill="hsl(0, 75%, 55%)" fontSize="10" fontFamily="Space Grotesk">Extreme Fear</text>
          <text x="220" y="165" fill="hsl(145, 70%, 50%)" fontSize="10" fontFamily="Space Grotesk">Extreme Optimism</text>
          <text x="130" y="30" fill="hsl(45, 95%, 55%)" fontSize="10" fontFamily="Space Grotesk">Neutral</text>

          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ transformOrigin: "150px 150px" }}
          >
            <line
              x1="150" y1="150" x2="150" y2="50"
              stroke="hsl(60, 10%, 92%)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Needle glow */}
            <line
              x1="150" y1="150" x2="150" y2="55"
              stroke="hsl(60, 10%, 92%)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.15"
            />
          </motion.g>

          {/* Center dot */}
          <circle cx="150" cy="150" r="8" fill="hsl(230, 20%, 10%)" stroke="hsl(60, 10%, 92%)" strokeWidth="2" />
        </svg>
      </div>

      {/* Score display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-2 text-center"
      >
        <span className={`font-display text-5xl font-bold ${moodColors[mood] || "text-foreground"}`}>
          {score}
        </span>
        <p className={`mt-1 font-display text-lg font-semibold tracking-wider ${moodColors[mood] || "text-foreground"}`}>
          {label}
        </p>
      </motion.div>
    </div>
  );
}
