create or replace function public.match_brain_embeddings(
  query_embedding vector(384),
  match_threshold float default 0.7,
  match_count int default 8,
  artifact_types text[] default null
)
returns table (
  id uuid,
  artifact_id uuid,
  artifact_type text,
  artifact_content text,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    be.id,
    be.artifact_id,
    be.artifact_type,
    be.artifact_content,
    1 - (be.embedding <=> query_embedding) as similarity
  from public.brain_embeddings be
  where be.embedding is not null
    and (artifact_types is null or be.artifact_type = any(artifact_types))
    and 1 - (be.embedding <=> query_embedding) > match_threshold
  order by be.embedding <=> query_embedding
  limit match_count
$$;

grant execute on function public.match_brain_embeddings(vector, float, int, text[]) to authenticated, service_role, anon;