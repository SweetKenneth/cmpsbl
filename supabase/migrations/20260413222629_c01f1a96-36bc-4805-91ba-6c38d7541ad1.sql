
CREATE TABLE public.cli_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  session_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  state_version INTEGER NOT NULL DEFAULT 1,
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_cli_sessions_developer ON public.cli_sessions(developer_id);
CREATE INDEX idx_cli_sessions_updated ON public.cli_sessions(updated_at DESC);

ALTER TABLE public.cli_sessions ENABLE ROW LEVEL SECURITY;

-- Edge function accesses via service role, but add anon-block policies
CREATE POLICY "No anonymous access to cli_sessions"
  ON public.cli_sessions FOR ALL
  TO anon
  USING (false);

CREATE POLICY "Authenticated users can read own cli_sessions"
  ON public.cli_sessions FOR SELECT
  TO authenticated
  USING (developer_id IN (
    SELECT id::text FROM public.access_developers WHERE user_id = auth.uid()
  ));
