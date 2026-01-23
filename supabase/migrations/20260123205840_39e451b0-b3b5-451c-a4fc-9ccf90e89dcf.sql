-- =============================================================
-- Brain Memory System v2.0 - Three-Tier Architecture
-- Adds warm storage, memory pruning, and enhanced knowledge graph
-- =============================================================

-- 1. Create the WARM memory tier (intermediate storage)
CREATE TABLE IF NOT EXISTS public.brain_memory_warm (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  core_summary TEXT,
  embedding vector(1536),
  context TEXT,
  goal_ref TEXT,
  priority INTEGER DEFAULT 5,
  value_score NUMERIC(4,3) DEFAULT 0.500,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  decay_rate NUMERIC(4,3) DEFAULT 0.010,
  source_memory_id UUID,
  tags JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  promoted_at TIMESTAMP WITH TIME ZONE,
  demoted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add value scoring columns to hot and cold storage
ALTER TABLE public.brain_memory_hot 
  ADD COLUMN IF NOT EXISTS value_score NUMERIC(4,3) DEFAULT 0.500,
  ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS decay_rate NUMERIC(4,3) DEFAULT 0.020,
  ADD COLUMN IF NOT EXISTS importance_score NUMERIC(4,3) DEFAULT 0.500,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.brain_memory_cold 
  ADD COLUMN IF NOT EXISTS value_score NUMERIC(4,3) DEFAULT 0.200,
  ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE;

-- 3. Enhanced Knowledge Graph - Add node types and more relation metadata
CREATE TABLE IF NOT EXISTS public.brain_graph_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_type TEXT NOT NULL, -- 'memory', 'concept', 'entity', 'insight', 'question'
  label TEXT NOT NULL,
  description TEXT,
  embedding vector(1536),
  memory_tier TEXT, -- 'hot', 'warm', 'cold'
  source_id UUID, -- Reference to original memory
  weight NUMERIC(4,3) DEFAULT 0.500,
  centrality_score NUMERIC(4,3) DEFAULT 0,
  cluster_id TEXT,
  attributes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enhanced edges with typed relations and temporal data
ALTER TABLE public.brain_graph_edges 
  ADD COLUMN IF NOT EXISTS relation_type TEXT DEFAULT 'semantic', -- semantic, causal, temporal, hierarchical, associative
  ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'bidirectional', -- unidirectional, bidirectional
  ADD COLUMN IF NOT EXISTS confidence NUMERIC(4,3) DEFAULT 0.500,
  ADD COLUMN IF NOT EXISTS temporal_context TEXT, -- past, present, future
  ADD COLUMN IF NOT EXISTS decay_weight NUMERIC(4,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE;

-- 5. Memory pruning audit table
CREATE TABLE IF NOT EXISTS public.brain_memory_pruned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_memory_id UUID NOT NULL,
  original_tier TEXT NOT NULL, -- hot, warm, cold
  content_preview TEXT, -- First 200 chars
  context TEXT,
  value_score NUMERIC(4,3),
  prune_reason TEXT NOT NULL,
  pruned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  can_restore BOOLEAN DEFAULT true,
  restore_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- 6. Memory tiering configuration
CREATE TABLE IF NOT EXISTS public.brain_tiering_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name TEXT NOT NULL UNIQUE,
  max_entries INTEGER,
  min_value_score NUMERIC(4,3),
  max_age_days INTEGER,
  auto_demote BOOLEAN DEFAULT true,
  auto_promote BOOLEAN DEFAULT true,
  prune_threshold NUMERIC(4,3),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Insert default tiering configuration
INSERT INTO public.brain_tiering_config (tier_name, max_entries, min_value_score, max_age_days, prune_threshold)
VALUES 
  ('hot', 500, 0.600, 7, 0.150),
  ('warm', 2000, 0.350, 30, 0.100),
  ('cold', 10000, 0.100, 365, 0.050)
ON CONFLICT (tier_name) DO NOTHING;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brain_memory_warm_value ON public.brain_memory_warm(value_score DESC);
CREATE INDEX IF NOT EXISTS idx_brain_memory_warm_context ON public.brain_memory_warm(context);
CREATE INDEX IF NOT EXISTS idx_brain_memory_warm_accessed ON public.brain_memory_warm(last_accessed DESC);
CREATE INDEX IF NOT EXISTS idx_brain_memory_hot_value ON public.brain_memory_hot(value_score DESC);
CREATE INDEX IF NOT EXISTS idx_brain_memory_hot_importance ON public.brain_memory_hot(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_brain_graph_nodes_type ON public.brain_graph_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_brain_graph_nodes_cluster ON public.brain_graph_nodes(cluster_id);
CREATE INDEX IF NOT EXISTS idx_brain_graph_edges_type ON public.brain_graph_edges(relation_type);
CREATE INDEX IF NOT EXISTS idx_brain_memory_pruned_restore ON public.brain_memory_pruned(restore_until) WHERE can_restore = true;

-- 9. Enable RLS
ALTER TABLE public.brain_memory_warm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_memory_pruned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_tiering_config ENABLE ROW LEVEL SECURITY;

-- 10. Create service role policies (brain operates autonomously)
CREATE POLICY "Service role full access - warm" ON public.brain_memory_warm 
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access - nodes" ON public.brain_graph_nodes 
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access - pruned" ON public.brain_memory_pruned 
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access - tiering" ON public.brain_tiering_config 
  FOR ALL USING (true) WITH CHECK (true);

-- 11. Function to calculate memory value score
CREATE OR REPLACE FUNCTION public.calculate_memory_value(
  p_access_count INTEGER,
  p_importance_score NUMERIC,
  p_age_days INTEGER,
  p_decay_rate NUMERIC
) RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_recency_factor NUMERIC;
  v_access_factor NUMERIC;
  v_value NUMERIC;
BEGIN
  -- Recency factor: exponential decay based on age
  v_recency_factor := EXP(-p_decay_rate * p_age_days);
  
  -- Access factor: logarithmic boost for frequently accessed memories
  v_access_factor := LEAST(1.0, 0.3 + 0.1 * LN(GREATEST(1, p_access_count)));
  
  -- Combined value score
  v_value := (p_importance_score * 0.4) + (v_recency_factor * 0.35) + (v_access_factor * 0.25);
  
  RETURN LEAST(1.0, GREATEST(0, v_value));
END;
$$;

-- 12. Trigger to auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_brain_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER update_brain_memory_warm_timestamp
  BEFORE UPDATE ON public.brain_memory_warm
  FOR EACH ROW EXECUTE FUNCTION public.update_brain_timestamp();

CREATE TRIGGER update_brain_graph_nodes_timestamp
  BEFORE UPDATE ON public.brain_graph_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_brain_timestamp();