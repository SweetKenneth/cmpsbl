
-- ═══════════════════════════════════════════════════════════════════
-- BRAIN Neural Substrate Layer — Database Schema
-- Plus automated maintenance infrastructure
-- ═══════════════════════════════════════════════════════════════════

-- 1. Embedding vector cache
CREATE TABLE public.brain_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artifact_id UUID NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('crystal', 'trace', 'heuristic', 'memory_hot', 'memory_warm')),
  artifact_content TEXT NOT NULL,
  embedding vector(384),
  model_version TEXT NOT NULL DEFAULT 'all-MiniLM-L6-v2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_brain_embeddings_artifact ON public.brain_embeddings (artifact_id, artifact_type);
CREATE INDEX idx_brain_embeddings_vector ON public.brain_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

ALTER TABLE public.brain_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to brain_embeddings" ON public.brain_embeddings FOR ALL USING (true) WITH CHECK (true);

-- 2. Classifier model storage
CREATE TABLE public.brain_classifier_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL CHECK (model_type IN ('confidence', 'drift_autoencoder')),
  weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  training_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  training_samples INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,4) DEFAULT 0,
  ece_score NUMERIC(5,4) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brain_classifier_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to brain_classifier_models" ON public.brain_classifier_models FOR ALL USING (true) WITH CHECK (true);

-- 3. Drift detection event log
CREATE TABLE public.brain_drift_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconstruction_error NUMERIC(10,6) NOT NULL,
  rolling_mean NUMERIC(10,6) NOT NULL,
  rolling_stddev NUMERIC(10,6) NOT NULL,
  sigma_deviation NUMERIC(6,3) NOT NULL,
  is_anomaly BOOLEAN NOT NULL DEFAULT false,
  domain TEXT,
  sample_artifact_ids UUID[] DEFAULT '{}',
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brain_drift_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to brain_drift_log" ON public.brain_drift_log FOR ALL USING (true) WITH CHECK (true);

-- 4. Maintenance automation log (tracks ALL automated maintenance tasks)
CREATE TABLE public.brain_maintenance_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  details JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_brain_maintenance_log_type ON public.brain_maintenance_log (task_type, created_at DESC);

ALTER TABLE public.brain_maintenance_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to brain_maintenance_log" ON public.brain_maintenance_log FOR ALL USING (true) WITH CHECK (true);

-- 5. Trigger for updated_at on brain_embeddings
CREATE TRIGGER update_brain_embeddings_timestamp
  BEFORE UPDATE ON public.brain_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.update_brain_timestamp();
