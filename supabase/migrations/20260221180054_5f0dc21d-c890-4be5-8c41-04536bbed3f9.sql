-- Create storage bucket for radio broadcasts
INSERT INTO storage.buckets (id, name, public)
VALUES ('radio', 'radio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to radio files
CREATE POLICY "Radio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'radio');

-- Allow service role to upload (edge functions use service role)
CREATE POLICY "Service role can upload radio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'radio');

CREATE POLICY "Service role can update radio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'radio');

CREATE POLICY "Service role can delete radio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'radio');