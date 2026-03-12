// 🔭 Opportunity Radar — higher when disruption creates openings
import { motion } from "framer-motion";

interface OpportunityGaugeProps {
  score: number;
  label: string;
}

export function OpportunityGauge({ score, label }: OpportunityGaugeProps) {
  const rotation = -90 + (score / 100) * 180;

  const getColor = (s: number) => {
    if (s >= 70) return "text-sentiment-positive";
    if (s >= 40) return "text-sentiment-neutral";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-72 md:h-52 md:w-96">
        <svg viewBox="0 0 300 170" className="h-full w-full">
          <defs>
            <linearGradient id="opportunityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(220, 14%, 70%)" />
              <stop offset="30%" stopColor="hsl(200, 60%, 50%)" />
              <stop offset="60%" stopColor="hsl(170, 55%, 45%)" />
              <stop offset="100%" stopColor="hsl(45, 90%, 52%)" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="hsl(0, 0%, 92%)" strokeWidth="22" strokeLinecap="round" />

          {/* Colored arc */}
          <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="url(#opportunityGradient)" strokeWidth="22" strokeLinecap="round" />

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
          <text x="30" y="168" fill="hsl(220, 14%, 70%)" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Low</text>
          <text x="270" y="168" fill="hsl(45, 90%, 52%)" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Prime</text>
          <text x="150" y="28" fill="hsl(200, 60%, 50%)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Moderate</text>

          {/* Center dot background — behind needle */}
          <circle cx="150" cy="150" r="7" fill="hsl(0, 0%, 100%)" stroke="hsl(0, 0%, 20%)" strokeWidth="2" />

          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1], delay: 0.8 }}
            style={{ transformOrigin: "150px 150px" }}
          >
            <line x1="150" y1="150" x2="150" y2="48" stroke="hsl(0, 0%, 20%)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="150" cy="48" r="4" fill="hsl(0, 0%, 20%)" />
          </motion.g>

          {/* Center dot overlay */}
          <circle cx="150" cy="150" r="3" fill="hsl(0, 0%, 20%)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="-mt-2 text-center"
      >
        <span className={`font-display text-5xl font-bold ${getColor(score)}`}>
          {score}
        </span>
        <p className={`mt-1 text-base font-medium tracking-wide ${getColor(score)}`}>
          {label}
        </p>
      </motion.div>
    </div>
  );
}
