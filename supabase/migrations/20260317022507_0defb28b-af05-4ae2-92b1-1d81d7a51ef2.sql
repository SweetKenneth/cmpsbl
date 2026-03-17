-- Add unique index on (user_id, slug) for artifact_registry to support upserts in the evolution engine
CREATE UNIQUE INDEX IF NOT EXISTS idx_artifact_registry_user_slug 
ON public.artifact_registry (user_id, slug);
