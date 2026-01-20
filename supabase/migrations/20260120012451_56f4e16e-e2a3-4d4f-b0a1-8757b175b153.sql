-- Create bots table for Cognitive Forge
CREATE TABLE public.bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Research', 'Analyst', 'Planner', 'Strategist', 'Hybrid')),
  config JSONB NOT NULL DEFAULT '{}',
  memory_mode TEXT NOT NULL CHECK (memory_mode IN ('Stateless', 'Episodic', 'Persistent')),
  providers JSONB NOT NULL DEFAULT '[]',
  capabilities JSONB NOT NULL DEFAULT '[]',
  delivery_format TEXT NOT NULL CHECK (delivery_format IN ('Repo', 'Download')),
  slug TEXT,
  export_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bots"
ON public.bots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bots"
ON public.bots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots"
ON public.bots FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bots"
ON public.bots FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_bots_user_id ON public.bots(user_id);
CREATE INDEX idx_bots_created_at ON public.bots(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bots_updated_at
BEFORE UPDATE ON public.bots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();