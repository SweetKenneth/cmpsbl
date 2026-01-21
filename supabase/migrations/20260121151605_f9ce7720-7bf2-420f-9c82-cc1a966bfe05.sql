-- ============================================
-- Agency Economics + Dream Learning Schema
-- ============================================

-- 1) Add economic fields to agency_tasks
ALTER TABLE public.agency_tasks 
ADD COLUMN IF NOT EXISTS task_value_cents integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS task_cost_cents integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS compute_time_ms integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS learning_gain numeric(4,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS roi numeric(6,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS preset_id text;

-- 2) Add skill progression to agency_members
ALTER TABLE public.agency_members 
ADD COLUMN IF NOT EXISTS skill_level text DEFAULT 'novice' CHECK (skill_level IN ('novice', 'intermediate', 'specialist', 'expert', 'strategist')),
ADD COLUMN IF NOT EXISTS success_rate numeric(5,4) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS task_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reflection_quality numeric(4,3) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS total_learning_gain numeric(8,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS competency_score numeric(6,2) DEFAULT 50;

-- 3) Create task_presets table
CREATE TABLE IF NOT EXISTS public.task_presets (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  estimated_value_cents integer DEFAULT 0,
  estimated_cost_cents integer DEFAULT 0,
  estimated_time_minutes integer DEFAULT 30,
  skill_required text DEFAULT 'novice',
  uses_execution_layer boolean DEFAULT true,
  action_sequence jsonb DEFAULT '[]'::jsonb,
  output_format text DEFAULT 'markdown',
  integrations_used text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Create substrate_heuristics table (for global learning)
CREATE TABLE IF NOT EXISTS public.substrate_heuristics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heuristic_type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  payload jsonb DEFAULT '{}'::jsonb,
  source_agency_id uuid REFERENCES public.agencies(id),
  source_task_id uuid,
  success_rate numeric(5,4) DEFAULT 0.8,
  usage_count integer DEFAULT 0,
  confidence numeric(4,3) DEFAULT 0.7,
  is_global boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5) Create substrate_templates table
CREATE TABLE IF NOT EXISTS public.substrate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL,
  preset_id text REFERENCES public.task_presets(id),
  name text NOT NULL,
  description text,
  action_sequence jsonb DEFAULT '[]'::jsonb,
  input_schema jsonb DEFAULT '{}'::jsonb,
  output_schema jsonb DEFAULT '{}'::jsonb,
  source_agency_id uuid REFERENCES public.agencies(id),
  success_rate numeric(5,4) DEFAULT 0.8,
  usage_count integer DEFAULT 0,
  version integer DEFAULT 1,
  is_global boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6) Create agency_economics table (aggregate tracking)
CREATE TABLE IF NOT EXISTS public.agency_economics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  period_date date NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed integer DEFAULT 0,
  total_value_cents integer DEFAULT 0,
  total_cost_cents integer DEFAULT 0,
  total_compute_time_ms bigint DEFAULT 0,
  total_learning_gain numeric(10,4) DEFAULT 0,
  avg_roi numeric(6,3) DEFAULT 0,
  success_rate numeric(5,4) DEFAULT 0,
  improvement_rate numeric(5,4) DEFAULT 0,
  convergence_speed numeric(6,3) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, period_date)
);

-- 7) Create substrate_brain_improvements table (if not exists)
CREATE TABLE IF NOT EXISTS public.substrate_brain_improvements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  improvement_type text NOT NULL,
  category text NOT NULL,
  title text,
  description text,
  payload jsonb DEFAULT '{}'::jsonb,
  source_count integer DEFAULT 1,
  confidence numeric(4,3) DEFAULT 0.7,
  adoption_count integer DEFAULT 0,
  version text DEFAULT '1.0.0',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8) Create dream_cycle_logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.dream_cycle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES public.agencies(id),
  cycle_type text NOT NULL,
  status text DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  improvements_generated integer DEFAULT 0,
  templates_created integer DEFAULT 0,
  heuristics_learned integer DEFAULT 0,
  artifacts_processed integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 9) Create dream_learning_metrics table (if not exists)
CREATE TABLE IF NOT EXISTS public.dream_learning_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES public.agencies(id),
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  skill_improvement_score numeric(5,4) DEFAULT 0,
  template_diff_score numeric(5,4) DEFAULT 0,
  artifact_quality_score numeric(5,4) DEFAULT 0,
  success_rate_delta numeric(5,4) DEFAULT 0,
  token_efficiency_delta numeric(5,4) DEFAULT 0,
  tasks_before integer DEFAULT 0,
  tasks_after integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_heuristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_brain_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_learning_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: task_presets (public read)
CREATE POLICY "Anyone can view task presets" ON public.task_presets FOR SELECT USING (true);

-- RLS Policies: substrate_heuristics
CREATE POLICY "View global or own heuristics" ON public.substrate_heuristics FOR SELECT 
  USING (is_global = true OR source_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));
CREATE POLICY "Create own heuristics" ON public.substrate_heuristics FOR INSERT 
  WITH CHECK (source_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- RLS Policies: substrate_templates
CREATE POLICY "View global or own templates" ON public.substrate_templates FOR SELECT 
  USING (is_global = true OR source_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));
CREATE POLICY "Create own templates" ON public.substrate_templates FOR INSERT 
  WITH CHECK (source_agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- RLS Policies: agency_economics
CREATE POLICY "View own economics" ON public.agency_economics FOR SELECT 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));
CREATE POLICY "Insert own economics" ON public.agency_economics FOR INSERT 
  WITH CHECK (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));
CREATE POLICY "Update own economics" ON public.agency_economics FOR UPDATE 
  USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- RLS Policies: substrate_brain_improvements (global read)
CREATE POLICY "Anyone can view improvements" ON public.substrate_brain_improvements FOR SELECT USING (is_active = true);

-- RLS Policies: dream_cycle_logs
CREATE POLICY "View own or global logs" ON public.dream_cycle_logs FOR SELECT 
  USING (agency_id IS NULL OR agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- RLS Policies: dream_learning_metrics
CREATE POLICY "View own metrics" ON public.dream_learning_metrics FOR SELECT 
  USING (agency_id IS NULL OR agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_presets_category ON public.task_presets(category);
CREATE INDEX IF NOT EXISTS idx_substrate_heuristics_type ON public.substrate_heuristics(heuristic_type);
CREATE INDEX IF NOT EXISTS idx_substrate_templates_preset ON public.substrate_templates(preset_id);
CREATE INDEX IF NOT EXISTS idx_agency_economics_date ON public.agency_economics(agency_id, period_date);
CREATE INDEX IF NOT EXISTS idx_dream_cycle_logs_agency ON public.dream_cycle_logs(agency_id);

-- Insert default task presets
INSERT INTO public.task_presets (id, name, description, category, estimated_value_cents, estimated_cost_cents, estimated_time_minutes, skill_required, uses_execution_layer, integrations_used, tags) VALUES
  ('competitor-deep-dive', 'Competitor Deep Dive', 'Comprehensive competitor analysis with positioning, pricing, and strategy breakdown', 'competitive', 15000, 500, 45, 'specialist', true, ARRAY['firecrawl', 'duckduckgo'], ARRAY['competitor', 'analysis', 'strategy']),
  ('seo-audit', 'SEO Audit', 'Full technical and content SEO audit with actionable recommendations', 'seo', 10000, 400, 30, 'intermediate', true, ARRAY['lighthouse', 'firecrawl'], ARRAY['seo', 'audit', 'technical']),
  ('local-seo-ranking', 'Local SEO Ranking Factors', 'Local search optimization analysis with GMB and citation audit', 'seo', 8000, 350, 25, 'intermediate', true, ARRAY['firecrawl', 'duckduckgo'], ARRAY['local-seo', 'gmb', 'citations']),
  ('ppc-keyword-research', 'PPC Keyword Research', 'Paid search keyword research with bid estimates and competition analysis', 'advertising', 12000, 450, 40, 'specialist', true, ARRAY['duckduckgo', 'firecrawl'], ARRAY['ppc', 'keywords', 'advertising']),
  ('market-sizing', 'Market Sizing Report', 'TAM/SAM/SOM analysis with growth projections and market dynamics', 'research', 20000, 600, 60, 'expert', true, ARRAY['sec-edgar', 'arxiv', 'firecrawl'], ARRAY['market', 'sizing', 'tam']),
  ('persona-brief', 'Persona Brief', 'Detailed buyer persona with demographics, psychographics, and journey mapping', 'research', 7500, 300, 25, 'intermediate', true, ARRAY['firecrawl', 'reddit'], ARRAY['persona', 'buyer', 'demographics']),
  ('content-cluster', 'Content Cluster Strategy', 'Topic cluster and pillar content strategy with keyword mapping', 'content', 9000, 400, 35, 'specialist', true, ARRAY['duckduckgo', 'firecrawl'], ARRAY['content', 'cluster', 'pillar']),
  ('social-calendar', 'Social Post Calendar', '30-day social media content calendar with hooks and hashtags', 'content', 5000, 250, 20, 'novice', true, ARRAY['firecrawl'], ARRAY['social', 'calendar', 'content']),
  ('feature-gap-matrix', 'Feature Gap Matrix', 'Competitive feature comparison matrix with opportunity scoring', 'competitive', 11000, 450, 40, 'specialist', true, ARRAY['firecrawl', 'github'], ARRAY['features', 'gap', 'competitive']),
  ('influencer-sourcing', 'Influencer Sourcing', 'Influencer identification and vetting with engagement analysis', 'marketing', 8500, 350, 30, 'intermediate', true, ARRAY['firecrawl', 'reddit'], ARRAY['influencer', 'sourcing', 'marketing']),
  ('product-research', 'Product Research Report', 'Product opportunity analysis with demand signals and supplier data', 'research', 14000, 500, 50, 'expert', true, ARRAY['firecrawl', 'duckduckgo'], ARRAY['product', 'research', 'opportunity']),
  ('vendor-discovery', 'Vendor Discovery', 'Qualified vendor list with capabilities, pricing, and review summary', 'operations', 6500, 300, 25, 'intermediate', true, ARRAY['firecrawl', 'duckduckgo'], ARRAY['vendor', 'discovery', 'procurement']),
  ('regulatory-scan', 'Regulatory Scan', 'FDA/SEC/GDPR compliance scan with requirement mapping', 'compliance', 18000, 550, 55, 'expert', true, ARRAY['sec-edgar', 'fda-openfda', 'firecrawl'], ARRAY['regulatory', 'compliance', 'legal']),
  ('pricing-analysis', 'Pricing Analysis', 'Competitive pricing analysis with elasticity estimates and positioning', 'competitive', 13000, 450, 45, 'specialist', true, ARRAY['firecrawl', 'duckduckgo'], ARRAY['pricing', 'analysis', 'competitive']),
  ('positioning-teardown', 'Positioning Tear-Down', 'Brand positioning analysis with messaging framework and differentiation', 'competitive', 10000, 400, 35, 'specialist', true, ARRAY['firecrawl'], ARRAY['positioning', 'brand', 'messaging'])
ON CONFLICT (id) DO NOTHING;

-- Function to update skill level based on performance
CREATE OR REPLACE FUNCTION public.update_agent_skill_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate skill level based on thresholds
  NEW.skill_level := CASE
    WHEN NEW.success_rate >= 0.95 AND NEW.task_count >= 100 AND NEW.reflection_quality >= 0.9 THEN 'strategist'
    WHEN NEW.success_rate >= 0.85 AND NEW.task_count >= 50 AND NEW.reflection_quality >= 0.75 THEN 'expert'
    WHEN NEW.success_rate >= 0.75 AND NEW.task_count >= 25 AND NEW.reflection_quality >= 0.6 THEN 'specialist'
    WHEN NEW.success_rate >= 0.6 AND NEW.task_count >= 10 THEN 'intermediate'
    ELSE 'novice'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic skill level updates
DROP TRIGGER IF EXISTS trigger_update_skill_level ON public.agency_members;
CREATE TRIGGER trigger_update_skill_level
  BEFORE UPDATE OF success_rate, task_count, reflection_quality ON public.agency_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_skill_level();

-- Function to update agency economics after task completion
CREATE OR REPLACE FUNCTION public.update_agency_economics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.agency_economics (agency_id, period_date, tasks_completed, total_value_cents, total_cost_cents, total_compute_time_ms, total_learning_gain)
    VALUES (NEW.agency_id, CURRENT_DATE, 1, COALESCE(NEW.task_value_cents, 0), COALESCE(NEW.task_cost_cents, 0), COALESCE(NEW.compute_time_ms, 0), COALESCE(NEW.learning_gain, 0))
    ON CONFLICT (agency_id, period_date) DO UPDATE SET
      tasks_completed = agency_economics.tasks_completed + 1,
      total_value_cents = agency_economics.total_value_cents + COALESCE(NEW.task_value_cents, 0),
      total_cost_cents = agency_economics.total_cost_cents + COALESCE(NEW.task_cost_cents, 0),
      total_compute_time_ms = agency_economics.total_compute_time_ms + COALESCE(NEW.compute_time_ms, 0),
      total_learning_gain = agency_economics.total_learning_gain + COALESCE(NEW.learning_gain, 0),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for economics update
DROP TRIGGER IF EXISTS trigger_update_economics ON public.agency_tasks;
CREATE TRIGGER trigger_update_economics
  AFTER UPDATE ON public.agency_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agency_economics();