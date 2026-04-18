-- Add 'dream' artifact type to brain_embeddings constraint
-- This enables DREAM-generated thoughts to flow into DECODE's recall context
ALTER TABLE public.brain_embeddings DROP CONSTRAINT IF EXISTS brain_embeddings_artifact_type_check;
ALTER TABLE public.brain_embeddings ADD CONSTRAINT brain_embeddings_artifact_type_check 
  CHECK (artifact_type = ANY (ARRAY[
    'crystal'::text, 
    'trace'::text, 
    'heuristic'::text, 
    'memory_hot'::text, 
    'memory_warm'::text, 
    'memory_cold'::text,
    'dream'::text
  ]));