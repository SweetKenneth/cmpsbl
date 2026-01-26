-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups', 
  false,
  524288000, -- 500MB limit
  ARRAY['application/json', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read their own backup exports
CREATE POLICY "Users can read backup exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'backups' 
  AND auth.role() = 'authenticated'
);

-- Allow service role to upload backups
CREATE POLICY "Service role can upload backups"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'backups'
  AND auth.role() = 'service_role'
);