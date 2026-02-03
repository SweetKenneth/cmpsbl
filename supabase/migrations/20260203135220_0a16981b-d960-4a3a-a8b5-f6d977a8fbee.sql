-- Create Lovable AI usage tracking table
CREATE TABLE IF NOT EXISTS public.lovable_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calls_used INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'evolution',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, category)
);

-- Enable RLS
ALTER TABLE public.lovable_ai_usage ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions)
CREATE POLICY "Service role full access on lovable_ai_usage"
  ON public.lovable_ai_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_lovable_ai_usage(
  p_calls INTEGER DEFAULT 1,
  p_tokens INTEGER DEFAULT 0,
  p_category TEXT DEFAULT 'evolution'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO lovable_ai_usage (date, calls_used, tokens_used, category)
  VALUES (CURRENT_DATE, p_calls, p_tokens, p_category)
  ON CONFLICT (date, category) DO UPDATE SET
    calls_used = lovable_ai_usage.calls_used + EXCLUDED.calls_used,
    tokens_used = lovable_ai_usage.tokens_used + EXCLUDED.tokens_used,
    updated_at = now();
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_lovable_ai_usage_timestamp
  BEFORE UPDATE ON public.lovable_ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brain_timestamp();