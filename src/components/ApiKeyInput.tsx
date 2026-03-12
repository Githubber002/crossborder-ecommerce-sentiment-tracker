// 🔑 API Key Input — sleek, minimal, HUD-style
import { useState } from "react";
import { motion } from "framer-motion";

export function ApiKeyInput({ onSubmit, isLoading }: { onSubmit: (key: string) => void; isLoading: boolean }) {
  const [key, setKey] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-md rounded-lg border border-border bg-card p-6"
    >
      <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Connect to NewsData.io</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Enter your API key to fetch live sentiment data. Get one at{" "}
        <a href="https://newsdata.io/search-dashboard" target="_blank" rel="noopener" className="text-primary underline">
          newsdata.io
        </a>
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="pub_xxxxxxxxxxxx"
          className="flex-1 rounded-md border border-input bg-secondary px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => key.trim() && onSubmit(key.trim())}
          disabled={!key.trim() || isLoading}
          className="rounded-md bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Scanning..." : "Scan"}
        </button>
      </div>
    </motion.div>
  );
}
