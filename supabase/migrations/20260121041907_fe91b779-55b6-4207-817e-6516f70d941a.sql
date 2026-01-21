-- Agency Tasks Table for real task execution and tracking
CREATE TABLE public.agency_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  assigned_member_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general', -- research, seo_scan, code_study, company_research, etc.
  status TEXT NOT NULL DEFAULT 'queued', -- queued, in_progress, completed, failed, paused
  priority INTEGER DEFAULT 50, -- 1-100
  progress INTEGER DEFAULT 0, -- 0-100
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  research_domain TEXT, -- Domain URL for research tasks
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agency Task Logs for detailed activity tracking
CREATE TABLE public.agency_task_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.agency_tasks(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.agency_members(id),
  log_type TEXT NOT NULL DEFAULT 'info', -- info, progress, insight, error, completion
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agency Settings for custom configuration
CREATE TABLE public.agency_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE UNIQUE,
  leader_name TEXT DEFAULT 'Team Lead',
  auto_research_enabled BOOLEAN DEFAULT true,
  shared_learning_enabled BOOLEAN DEFAULT true,
  default_research_domains JSONB DEFAULT '["perplexity.ai", "github.com", "stackoverflow.com"]',
  preset_commands JSONB DEFAULT '[]',
  notification_preferences JSONB DEFAULT '{}',
  theme_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agency_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agency_tasks
CREATE POLICY "Users can view tasks for agencies they own"
  ON public.agency_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE agencies.id = agency_tasks.agency_id 
      AND agencies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for agencies they own"
  ON public.agency_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE agencies.id = agency_tasks.agency_id 
      AND agencies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for agencies they own"
  ON public.agency_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE agencies.id = agency_tasks.agency_id 
      AND agencies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for agencies they own"
  ON public.agency_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE agencies.id = agency_tasks.agency_id 
      AND agencies.owner_id = auth.uid()
    )
  );

-- RLS Policies for agency_task_logs
CREATE POLICY "Users can view task logs for agencies they own"
  ON public.agency_task_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_tasks 
      JOIN public.agencies ON agencies.id = agency_tasks.agency_id
      WHERE agency_tasks.id = agency_task_logs.task_id 
      AND agencies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert task logs for agencies they own"
  ON public.agency_task_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agency_tasks 
      JOIN public.agencies ON agencies.id = agency_tasks.agency_id
      WHERE agency_tasks.id = agency_task_logs.task_id 
      AND agencies.owner_id = auth.uid()
    )
  );

-- RLS Policies for agency_settings
CREATE POLICY "Users can view settings for agencies they own"
  ON public.agency_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE agencies.id = agency_settings.agency_id 
      AND agencies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert settings for agencies they own"
  ON public.agency_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE agencies.id = agency_settings.agency_id 
      AND agencies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update settings for agencies they own"
  ON public.agency_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE agencies.id = agency_settings.agency_id 
      AND agencies.owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_agency_tasks_agency_id ON public.agency_tasks(agency_id);
CREATE INDEX idx_agency_tasks_status ON public.agency_tasks(status);
CREATE INDEX idx_agency_tasks_member ON public.agency_tasks(assigned_member_id);
CREATE INDEX idx_agency_task_logs_task_id ON public.agency_task_logs(task_id);
CREATE INDEX idx_agency_settings_agency_id ON public.agency_settings(agency_id);

-- Trigger for updated_at
CREATE TRIGGER update_agency_tasks_updated_at
  BEFORE UPDATE ON public.agency_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_settings_updated_at
  BEFORE UPDATE ON public.agency_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for task tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_task_logs;