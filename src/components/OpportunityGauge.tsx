// 🔭 Opportunity Bar — horizontal bar with diverging color
import { motion } from "framer-motion";

interface OpportunityGaugeProps {
  score: number;
  label: string;
}

export function OpportunityGauge({ score, label }: OpportunityGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 70) return "text-sentiment-positive";
    if (s >= 40) return "text-sentiment-neutral";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score + Label */}
      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={`font-display text-5xl font-bold ${getColor(score)}`}
        >
          {score}
        </motion.span>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className={`mt-1 text-base font-medium tracking-wide ${getColor(score)}`}
        >
          {label}
        </motion.p>
      </div>

      {/* Diverging gradient bar */}
      <div className="w-full max-w-md">
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
          {/* Gradient: muted grey → blue → teal → gold */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(to right, hsl(220, 14%, 70%), hsl(200, 60%, 50%), hsl(170, 55%, 45%), hsl(45, 90%, 52%))",
            }}
          />
          {/* Mask */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${100 - score}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
            className="absolute right-0 top-0 h-full rounded-r-full bg-secondary"
          />
        </div>

        {/* Scale labels */}
        <div className="mt-1.5 flex justify-between text-[10px] font-medium">
          <span className="text-muted-foreground">Low</span>
          <span style={{ color: "hsl(200, 60%, 50%)" }}>Moderate</span>
          <span style={{ color: "hsl(45, 90%, 52%)" }}>Prime</span>
        </div>
      </div>
    </div>
  );
}
