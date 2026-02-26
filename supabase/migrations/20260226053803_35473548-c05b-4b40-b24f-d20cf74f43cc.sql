-- Allow authenticated users to read ai_usage_log for dashboard metrics
CREATE POLICY "Authenticated users can read ai_usage_log"
ON public.ai_usage_log
FOR SELECT
USING (auth.role() = 'authenticated');
