-- Create table for storing generated templates
CREATE TABLE IF NOT EXISTS public.marketplace_generated_templates (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  rarity TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  code TEXT NOT NULL,
  estimated_value_cents INTEGER DEFAULT 0,
  ai_provider TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  downloaded_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.marketplace_generated_templates ENABLE ROW LEVEL SECURITY;

-- Users can only see their own generated templates
CREATE POLICY "Users can view own generated templates"
ON public.marketplace_generated_templates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own generated templates (via edge function)
CREATE POLICY "Users can insert own generated templates"
ON public.marketplace_generated_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates (download count, etc.)
CREATE POLICY "Users can update own generated templates"
ON public.marketplace_generated_templates
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for user lookups
CREATE INDEX idx_generated_templates_user_id ON public.marketplace_generated_templates(user_id);
CREATE INDEX idx_generated_templates_session ON public.marketplace_generated_templates(session_id);
CREATE INDEX idx_generated_templates_rarity ON public.marketplace_generated_templates(rarity);