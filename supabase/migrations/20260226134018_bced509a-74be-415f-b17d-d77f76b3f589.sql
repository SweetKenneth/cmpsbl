
-- Knowledge Crystals: distilled, compressed knowledge from memory clusters
CREATE TABLE public.brain_knowledge_crystals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crystal_type TEXT NOT NULL DEFAULT 'memory_cluster',
  title TEXT NOT NULL,
  distilled_content TEXT NOT NULL,
  source_memory_ids UUID[] DEFAULT '{}',
  source_tier TEXT DEFAULT 'hot',
  source_module TEXT,
  source_count INTEGER DEFAULT 0,
  compression_ratio NUMERIC DEFAULT 0,
  confidence NUMERIC DEFAULT 0.5,
  teacher_model TEXT DEFAULT 'google/gemini-2.5-pro',
  student_model TEXT DEFAULT 'google/gemini-2.5-flash-lite',
  reasoning_trace TEXT,
  domain TEXT,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cross-Module Transfer Heuristics
CREATE TABLE public.brain_transfer_heuristics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_module TEXT NOT NULL,
  target_modules TEXT[] DEFAULT '{}',
  heuristic_name TEXT NOT NULL,
  heuristic_content TEXT NOT NULL,
  generalization_score NUMERIC DEFAULT 0.5,
  applicability_domains TEXT[] DEFAULT '{}',
  confidence NUMERIC DEFAULT 0.5,
  teacher_model TEXT DEFAULT 'google/gemini-2.5-pro',
  applied_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teacher-Student Reasoning Traces
CREATE TABLE public.brain_reasoning_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trace_type TEXT NOT NULL DEFAULT 'reasoning_chain',
  domain TEXT,
  module TEXT,
  teacher_model TEXT NOT NULL DEFAULT 'google/gemini-2.5-pro',
  student_model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash-lite',
  prompt TEXT NOT NULL,
  teacher_response TEXT NOT NULL,
  distilled_pattern TEXT,
  pattern_confidence NUMERIC DEFAULT 0.5,
  token_savings_pct NUMERIC DEFAULT 0,
  applied_count INTEGER DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Distillation run tracking
CREATE TABLE public.brain_distillation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  calls_used INTEGER DEFAULT 0,
  crystals_created INTEGER DEFAULT 0,
  heuristics_created INTEGER DEFAULT 0,
  traces_created INTEGER DEFAULT 0,
  memories_processed INTEGER DEFAULT 0,
  compression_ratio_avg NUMERIC DEFAULT 0,
  confidence_avg NUMERIC DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.brain_knowledge_crystals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_transfer_heuristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_reasoning_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_distillation_runs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service role for edge functions, admin role for dashboard)
CREATE POLICY "Admin read crystals" ON public.brain_knowledge_crystals
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read heuristics" ON public.brain_transfer_heuristics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read traces" ON public.brain_reasoning_traces
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read distillation runs" ON public.brain_distillation_runs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_crystals_domain ON public.brain_knowledge_crystals (domain);
CREATE INDEX idx_crystals_module ON public.brain_knowledge_crystals (source_module);
CREATE INDEX idx_crystals_created ON public.brain_knowledge_crystals (created_at DESC);
CREATE INDEX idx_heuristics_source ON public.brain_transfer_heuristics (source_module);
CREATE INDEX idx_traces_domain ON public.brain_reasoning_traces (domain);
CREATE INDEX idx_distillation_runs_status ON public.brain_distillation_runs (status, created_at DESC);

-- Timestamp trigger
CREATE TRIGGER update_crystals_timestamp BEFORE UPDATE ON public.brain_knowledge_crystals
  FOR EACH ROW EXECUTE FUNCTION public.update_brain_timestamp();
CREATE TRIGGER update_heuristics_timestamp BEFORE UPDATE ON public.brain_transfer_heuristics
  FOR EACH ROW EXECUTE FUNCTION public.update_brain_timestamp();
