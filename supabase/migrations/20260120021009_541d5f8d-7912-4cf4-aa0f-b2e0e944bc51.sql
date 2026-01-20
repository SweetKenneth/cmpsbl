-- Cognitive Registry Table for D-Mode Forge
-- Tracks minted cognitives with repo, runtime, and metadata

CREATE TABLE public.cognitive_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('Research', 'Coding', 'Analyst', 'Ops', 'Writing', 'Hybrid')),
  version TEXT NOT NULL DEFAULT '1.0.0',
  owner UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  memory_mode TEXT NOT NULL CHECK (memory_mode IN ('Stateless', 'Episodic', 'Persistent', 'CognitiveGraph', 'DreamRetention')),
  learning_mode TEXT[] DEFAULT ARRAY['task']::TEXT[],
  dream_enabled BOOLEAN DEFAULT false,
  graph_enabled BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '[]'::JSONB,
  providers JSONB DEFAULT '[]'::JSONB,
  repo_url TEXT,
  api_url TEXT,
  export_path TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deprecated', 'pending')),
  metrics JSONB DEFAULT '{}'::JSONB,
  last_run_at TIMESTAMP WITH TIME ZONE,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cognitive_registry ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own cognitives" 
ON public.cognitive_registry 
FOR SELECT 
USING (auth.uid() = owner);

CREATE POLICY "Users can create their own cognitives" 
ON public.cognitive_registry 
FOR INSERT 
WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own cognitives" 
ON public.cognitive_registry 
FOR UPDATE 
USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own cognitives" 
ON public.cognitive_registry 
FOR DELETE 
USING (auth.uid() = owner);

-- Admins can view all cognitives
CREATE POLICY "Admins can view all cognitives"
ON public.cognitive_registry
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_cognitive_registry_updated_at
BEFORE UPDATE ON public.cognitive_registry
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_cognitive_registry_owner ON public.cognitive_registry(owner);
CREATE INDEX idx_cognitive_registry_status ON public.cognitive_registry(status);
CREATE INDEX idx_cognitive_registry_class ON public.cognitive_registry(class);