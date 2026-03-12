
-- Create storage bucket for automated failsafe backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'failsafe-backups',
  'failsafe-backups',
  false,
  104857600,
  ARRAY['application/zip', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: only service role can access (no user policies needed — cron uses service key)
CREATE POLICY "Service role only for failsafe backups"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'failsafe-backups')
WITH CHECK (bucket_id = 'failsafe-backups');
