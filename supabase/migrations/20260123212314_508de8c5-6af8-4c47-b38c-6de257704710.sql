-- ════════════════════════════════════════════════════════════════
-- BACKUP SYSTEM v2.0 — Portable Exports + Retention Policy
-- ════════════════════════════════════════════════════════════════

-- Create backup_exports table for tracking downloadable exports
CREATE TABLE IF NOT EXISTS public.backup_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id TEXT NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('full', 'portable')),
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  includes_secrets BOOLEAN DEFAULT false,
  download_token TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on backup_exports
ALTER TABLE public.backup_exports ENABLE ROW LEVEL SECURITY;

-- Only admins can access exports
CREATE POLICY "Admins can manage backup exports"
  ON public.backup_exports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Create backup_import_log for tracking imports
CREATE TABLE IF NOT EXISTS public.backup_import_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_backup_id TEXT NOT NULL,
  source_project_id TEXT,
  import_status TEXT DEFAULT 'pending',
  tables_restored JSONB DEFAULT '{}',
  errors JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  imported_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.backup_import_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view import logs"
  ON public.backup_import_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Comment on tables
COMMENT ON TABLE public.backup_exports IS 'Tracks downloadable backup exports with optional secrets';
COMMENT ON TABLE public.backup_import_log IS 'Tracks backup imports from external sources';