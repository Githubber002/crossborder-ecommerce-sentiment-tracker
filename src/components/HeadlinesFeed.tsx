// 📰 Headlines Feed — color-coded, emoji-tagged, pure signal
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface Article {
  title: string;
  description: string;
  source: string;
  url: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  pubDate: string;
}

const sentimentStyle = {
  positive: { emoji: "😊", color: "text-sentiment-positive", border: "border-l-sentiment-positive", bg: "bg-sentiment-positive/5" },
  negative: { emoji: "😠", color: "text-sentiment-negative", border: "border-l-sentiment-negative", bg: "bg-sentiment-negative/5" },
  neutral: { emoji: "😐", color: "text-sentiment-neutral", border: "border-l-sentiment-neutral", bg: "bg-sentiment-neutral/5" },
};

export function HeadlinesFeed({ articles }: { articles: Article[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
        Top Headlines
      </h3>

      <div className="space-y-2">
        {articles.slice(0, 8).map((article, i) => {
          const style = sentimentStyle[article.sentiment];
          return (
            <motion.a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
              className={`group flex items-start gap-3 rounded-md border-l-4 ${style.border} ${style.bg} px-4 py-3 transition-colors hover:bg-secondary`}
            >
              <span className="mt-0.5 text-base">{style.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                  {article.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {article.source} {article.pubDate && `· ${article.pubDate.split(" ")[0]}`}
                </p>
              </div>
              <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
