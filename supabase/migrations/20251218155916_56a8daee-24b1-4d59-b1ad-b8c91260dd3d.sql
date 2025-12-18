-- Create pf_merger_intents table (referenced by fusions)
CREATE TABLE public.pf_merger_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  prompt_text TEXT NOT NULL,
  parsed_requirements JSONB DEFAULT '{}'::jsonb,
  complexity_score NUMERIC DEFAULT 0.5,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pf_merger_fusions table
CREATE TABLE public.pf_merger_fusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID REFERENCES public.pf_merger_intents(id) ON DELETE CASCADE,
  model_used TEXT,
  blueprint_ref TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  fusion_output JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create pf_mvp_projects table (main projects table)
CREATE TABLE public.pf_mvp_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  fusion_id UUID REFERENCES public.pf_merger_fusions(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  build_status TEXT DEFAULT 'pending',
  current_phase TEXT DEFAULT 'init',
  progress_percentage INTEGER DEFAULT 0,
  deploy_url TEXT,
  preview_url TEXT,
  github_repo TEXT,
  build_logs JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  feedback_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ
);

-- Create pf_merger_metrics table
CREATE TABLE public.pf_merger_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.pf_mvp_projects(id) ON DELETE CASCADE,
  build_time_ms INTEGER,
  lines_of_code INTEGER,
  component_count INTEGER,
  api_calls_made INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pf_merger_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_merger_fusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_mvp_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_merger_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for pf_merger_intents
CREATE POLICY "Users can view own intents" ON public.pf_merger_intents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own intents" ON public.pf_merger_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access intents" ON public.pf_merger_intents
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for pf_merger_fusions
CREATE POLICY "Users can view own fusions" ON public.pf_merger_fusions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pf_merger_intents WHERE id = intent_id AND user_id = auth.uid())
  );
CREATE POLICY "Service role full access fusions" ON public.pf_merger_fusions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for pf_mvp_projects
CREATE POLICY "Users can view own projects" ON public.pf_mvp_projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.pf_mvp_projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access projects" ON public.pf_mvp_projects
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for pf_merger_metrics
CREATE POLICY "Users can view own metrics" ON public.pf_merger_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pf_mvp_projects WHERE id = project_id AND user_id = auth.uid())
  );
CREATE POLICY "Service role full access metrics" ON public.pf_merger_metrics
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_pf_mvp_projects_user_id ON public.pf_mvp_projects(user_id);
CREATE INDEX idx_pf_mvp_projects_status ON public.pf_mvp_projects(build_status);
CREATE INDEX idx_pf_merger_intents_user_id ON public.pf_merger_intents(user_id);