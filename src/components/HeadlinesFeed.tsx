// 📰 Headlines Feed — color-coded, emoji-tagged, pure signal
import { motion } from "framer-motion";
import { ArticleSentiment } from "@/types/sentiment";

const sentimentStyle = {
  positive: { emoji: "😊", color: "text-sentiment-positive", border: "border-l-sentiment-positive" },
  negative: { emoji: "😠", color: "text-sentiment-negative", border: "border-l-sentiment-negative" },
  neutral: { emoji: "😐", color: "text-sentiment-neutral", border: "border-l-sentiment-neutral" },
};

export function HeadlinesFeed({ articles }: { articles: ArticleSentiment[] }) {
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

      <div className="space-y-3">
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
              className={`block rounded-md border-l-4 ${style.border} bg-secondary/50 px-4 py-3 transition-colors hover:bg-secondary`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-lg">{style.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-medium text-foreground">
                    {article.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {article.source} {article.pubDate && `· ${article.pubDate}`}
                  </p>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
