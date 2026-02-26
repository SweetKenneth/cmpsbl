
-- Tighten brain_* table RLS policies from "allow all" to proper role-based access

-- brain_embeddings
DROP POLICY IF EXISTS "Allow all access to brain_embeddings" ON public.brain_embeddings;
CREATE POLICY "Service role manages brain_embeddings"
  ON public.brain_embeddings FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read brain_embeddings"
  ON public.brain_embeddings FOR SELECT
  TO authenticated
  USING (true);

-- brain_classifier_models
DROP POLICY IF EXISTS "Allow all access to brain_classifier_models" ON public.brain_classifier_models;
CREATE POLICY "Service role manages brain_classifier_models"
  ON public.brain_classifier_models FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read brain_classifier_models"
  ON public.brain_classifier_models FOR SELECT
  TO authenticated
  USING (true);

-- brain_drift_log
DROP POLICY IF EXISTS "Allow all access to brain_drift_log" ON public.brain_drift_log;
CREATE POLICY "Service role manages brain_drift_log"
  ON public.brain_drift_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read brain_drift_log"
  ON public.brain_drift_log FOR SELECT
  TO authenticated
  USING (true);

-- brain_maintenance_log
DROP POLICY IF EXISTS "Allow all access to brain_maintenance_log" ON public.brain_maintenance_log;
CREATE POLICY "Service role manages brain_maintenance_log"
  ON public.brain_maintenance_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read brain_maintenance_log"
  ON public.brain_maintenance_log FOR SELECT
  TO authenticated
  USING (true);

-- Create ONNX model storage bucket for neural substrate
INSERT INTO storage.buckets (id, name, public) VALUES ('neural-models', 'neural-models', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read neural models"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'neural-models');

CREATE POLICY "Service role manages neural models"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'neural-models');
