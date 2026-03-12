// 📰 Headlines Feed — clean editorial cards
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

const sentimentEmoji = { positive: "😊", negative: "😠", neutral: "😐" };
const sentimentBorder = {
  positive: "border-l-sentiment-positive",
  negative: "border-l-sentiment-negative",
  neutral: "border-l-sentiment-neutral",
};

export function HeadlinesFeed({ articles }: { articles: Article[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h3 className="mb-4 font-display text-lg font-bold text-foreground">Top Headlines</h3>

      <div className="space-y-2">
        {articles.slice(0, 8).map((article, i) => (
          <motion.a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.06 }}
            className={`group flex items-start gap-3 rounded-md border border-border border-l-4 ${sentimentBorder[article.sentiment]} bg-card px-4 py-3 transition-colors hover:bg-accent`}
          >
            <span className="mt-0.5 text-sm">{sentimentEmoji[article.sentiment]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                {article.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {article.source}{article.pubDate && ` · ${article.pubDate.split(" ")[0]}`}
              </p>
            </div>
            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
