-- Migrate brain_embeddings from vector(384) to vector(1536) for native OpenAI text-embedding-3-small.
-- brain_embeddings is currently empty (0 rows), so a destructive resize is safe.

-- Drop dependents first
DROP INDEX IF EXISTS public.idx_brain_embeddings_vector;
DROP FUNCTION IF EXISTS public.match_brain_embeddings(vector, float, int, text[]);

-- Resize column. Empty table, so no USING clause needed.
ALTER TABLE public.brain_embeddings
  ALTER COLUMN embedding TYPE vector(1536);

-- Recreate ANN index (ivfflat works fine for 1536-d, lists tuned for small/early dataset)
CREATE INDEX idx_brain_embeddings_vector
  ON public.brain_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Recreate match function with 1536-d signature
CREATE OR REPLACE FUNCTION public.match_brain_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 8,
  artifact_types text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  artifact_id uuid,
  artifact_type text,
  artifact_content text,
  similarity float
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    be.id,
    be.artifact_id,
    be.artifact_type,
    be.artifact_content,
    1 - (be.embedding <=> query_embedding) AS similarity
  FROM public.brain_embeddings be
  WHERE be.embedding IS NOT NULL
    AND (artifact_types IS NULL OR be.artifact_type = ANY(artifact_types))
    AND 1 - (be.embedding <=> query_embedding) > match_threshold
  ORDER BY be.embedding <=> query_embedding
  LIMIT match_count
$$;

GRANT EXECUTE ON FUNCTION public.match_brain_embeddings(vector, float, int, text[])
  TO authenticated, service_role, anon;