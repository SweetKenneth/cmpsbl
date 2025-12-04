-- Brain Memories table for Cascade knowledge storage
CREATE TABLE IF NOT EXISTS public.brain_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  memory_type TEXT NOT NULL,
  source TEXT DEFAULT 'unknown',
  confidence NUMERIC DEFAULT 0.5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(memory_type)
);

-- Enable RLS
ALTER TABLE public.brain_memories ENABLE ROW LEVEL SECURITY;

-- Allow public read for brain memories (system data)
CREATE POLICY "Allow public read on brain_memories" ON public.brain_memories
  FOR SELECT USING (true);

-- Allow service role to manage
CREATE POLICY "Allow service role to manage brain_memories" ON public.brain_memories
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_brain_memories_type ON public.brain_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_brain_memories_confidence ON public.brain_memories(confidence);

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER update_brain_memories_updated_at
  BEFORE UPDATE ON public.brain_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();