
-- Server-side sentiment cache — only refreshes once per day
CREATE TABLE public.sentiment_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public read access, no auth needed
ALTER TABLE public.sentiment_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sentiment cache"
  ON public.sentiment_cache
  FOR SELECT
  USING (true);
