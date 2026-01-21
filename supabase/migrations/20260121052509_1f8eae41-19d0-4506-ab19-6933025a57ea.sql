-- Agency scheduled tasks for recurring automation
CREATE TABLE IF NOT EXISTS public.agency_scheduled_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  input_data JSONB DEFAULT '{}',
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly')),
  schedule_time TIME DEFAULT '09:00:00',
  schedule_day_of_week INTEGER CHECK (schedule_day_of_week >= 0 AND schedule_day_of_week <= 6),
  schedule_day_of_month INTEGER CHECK (schedule_day_of_month >= 1 AND schedule_day_of_month <= 28),
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  last_task_id UUID REFERENCES public.agency_tasks(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  run_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task deliverables for exports and reports
CREATE TABLE IF NOT EXISTS public.agency_task_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.agency_tasks(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('markdown', 'pdf', 'json', 'csv', 'html')),
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  file_size_bytes INTEGER,
  download_count INTEGER DEFAULT 0,
  emailed_to TEXT[],
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email notifications queue for agency tasks
CREATE TABLE IF NOT EXISTS public.agency_email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.agency_tasks(id) ON DELETE SET NULL,
  deliverable_id UUID REFERENCES public.agency_task_deliverables(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL CHECK (email_type IN ('task_complete', 'daily_brief', 'weekly_report', 'alert', 'deliverable')),
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agency_scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_task_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_email_queue ENABLE ROW LEVEL SECURITY;

-- RLS: Agency owners can manage scheduled tasks
CREATE POLICY "Agency owners can view scheduled tasks"
  ON public.agency_scheduled_tasks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.agencies WHERE id = agency_id AND owner_id = auth.uid())
  );

CREATE POLICY "Agency owners can create scheduled tasks"
  ON public.agency_scheduled_tasks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.agencies WHERE id = agency_id AND owner_id = auth.uid())
  );

CREATE POLICY "Agency owners can update scheduled tasks"
  ON public.agency_scheduled_tasks FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.agencies WHERE id = agency_id AND owner_id = auth.uid())
  );

CREATE POLICY "Agency owners can delete scheduled tasks"
  ON public.agency_scheduled_tasks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.agencies WHERE id = agency_id AND owner_id = auth.uid())
  );

-- RLS: Agency owners can view deliverables
CREATE POLICY "Agency owners can view deliverables"
  ON public.agency_task_deliverables FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.agencies WHERE id = agency_id AND owner_id = auth.uid())
  );

CREATE POLICY "Service role can manage deliverables"
  ON public.agency_task_deliverables FOR ALL
  USING (auth.role() = 'service_role');

-- RLS: Email queue managed by service role only
CREATE POLICY "Service role can manage email queue"
  ON public.agency_email_queue FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Agency owners can view their email queue"
  ON public.agency_email_queue FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.agencies WHERE id = agency_id AND owner_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON public.agency_scheduled_tasks(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_agency ON public.agency_scheduled_tasks(agency_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_task ON public.agency_task_deliverables(task_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_agency ON public.agency_task_deliverables(agency_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.agency_email_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_agency ON public.agency_email_queue(agency_id);

-- Update trigger for scheduled tasks
CREATE OR REPLACE TRIGGER update_scheduled_tasks_updated_at
  BEFORE UPDATE ON public.agency_scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();