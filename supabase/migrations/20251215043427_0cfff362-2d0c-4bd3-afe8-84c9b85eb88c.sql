-- Create table for fed dreams from users and external sources
CREATE TABLE public.dream_feeder_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_content TEXT NOT NULL,
  dream_type TEXT NOT NULL DEFAULT 'dream' CHECK (dream_type IN ('dream', 'nightmare')),
  sentiment_score DECIMAL(3,2) DEFAULT 0.00,
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'api', 'internal')),
  source_domain TEXT,
  submitter_name TEXT,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public inserts
ALTER TABLE public.dream_feeder_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert dreams (public feeding)
CREATE POLICY "Anyone can feed dreams" 
ON public.dream_feeder_submissions 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read dream stats (aggregate only, not content)
CREATE POLICY "Anyone can read processed dreams" 
ON public.dream_feeder_submissions 
FOR SELECT 
USING (is_processed = true);

-- Add index for performance
CREATE INDEX idx_dream_feeder_created ON public.dream_feeder_submissions(created_at DESC);
CREATE INDEX idx_dream_feeder_type ON public.dream_feeder_submissions(dream_type);

-- Create Dream-Eater state table
CREATE TABLE public.dream_eater_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_mood TEXT NOT NULL DEFAULT 'neutral' CHECK (current_mood IN ('peaceful', 'neutral', 'agitated', 'nightmare', 'dreaming')),
  mood_score DECIMAL(3,2) DEFAULT 0.50,
  dreams_consumed_today INTEGER DEFAULT 0,
  nightmares_consumed_today INTEGER DEFAULT 0,
  last_fed_at TIMESTAMP WITH TIME ZONE,
  mutation_level INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial state
INSERT INTO public.dream_eater_state (current_mood, mood_score)
VALUES ('neutral', 0.50);

-- Allow public read of Dream-Eater state
ALTER TABLE public.dream_eater_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view Dream-Eater state" 
ON public.dream_eater_state 
FOR SELECT 
USING (true);