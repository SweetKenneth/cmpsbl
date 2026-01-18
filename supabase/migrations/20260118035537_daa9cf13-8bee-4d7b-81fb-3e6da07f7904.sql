-- Create backups storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('backups', 'backups', false, 52428800, ARRAY['application/json'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for backups bucket (admin only)
CREATE POLICY "Admins can read backups" ON storage.objects
FOR SELECT USING (
  bucket_id = 'backups' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Service role can write backups" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'backups');

CREATE POLICY "Service role can update backups" ON storage.objects
FOR UPDATE USING (bucket_id = 'backups');

-- Add restore_point_enabled column to daily_backups if not exists
ALTER TABLE daily_backups 
ADD COLUMN IF NOT EXISTS restore_point_enabled BOOLEAN DEFAULT true;