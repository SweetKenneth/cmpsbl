
-- ═══════════════════════════════════════════════════════════════════
-- CMPSBL OS v10.9.0 — Full Cognitive Memory Upgrade (15 Features)
-- ═══════════════════════════════════════════════════════════════════

-- 1. VECTOR SEARCH — Add embedding column + HNSW index to hot/warm tiers
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE brain_memory_cold ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_brain_hot_embedding ON brain_memory_hot USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_brain_warm_embedding ON brain_memory_warm USING hnsw (embedding vector_cosine_ops);

-- 2. SPACED REPETITION — Track reinforcement scheduling
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS repetition_interval_days INTEGER DEFAULT 1;
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ;
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS ease_factor NUMERIC DEFAULT 2.5;
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS repetition_interval_days INTEGER DEFAULT 1;
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ;
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS ease_factor NUMERIC DEFAULT 2.5;
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 6. CONTRADICTION DETECTION
CREATE TABLE IF NOT EXISTS brain_memory_contradictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_id TEXT,
  memory_a_id UUID NOT NULL,
  memory_a_content TEXT NOT NULL,
  memory_a_tier TEXT NOT NULL,
  memory_b_id UUID NOT NULL,
  memory_b_content TEXT NOT NULL,
  memory_b_tier TEXT NOT NULL,
  contradiction_type TEXT DEFAULT 'factual',
  confidence NUMERIC DEFAULT 0.5,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE brain_memory_contradictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read contradictions" ON brain_memory_contradictions FOR SELECT USING (true);

-- 7. CAUSAL GRAPH — Create knowledge edges table with causal support
CREATE TABLE IF NOT EXISTS brain_knowledge_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_memory_id UUID NOT NULL,
  target_memory_id UUID NOT NULL,
  relationship_type TEXT DEFAULT 'related',
  strength NUMERIC DEFAULT 0.5,
  causal_direction TEXT,
  evidence_count INTEGER DEFAULT 1,
  last_reinforced_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID,
  agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE brain_knowledge_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read edges" ON brain_knowledge_edges FOR SELECT USING (true);
CREATE POLICY "Insert edges" ON brain_knowledge_edges FOR INSERT WITH CHECK (true);
CREATE POLICY "Update edges" ON brain_knowledge_edges FOR UPDATE USING (true);

-- 8. CONFIDENCE DECAY — Per-type decay rates
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS decay_curve TEXT DEFAULT 'standard';
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS decay_curve TEXT DEFAULT 'standard';
ALTER TABLE brain_memory_cold ADD COLUMN IF NOT EXISTS decay_curve TEXT DEFAULT 'standard';

-- 12. MEMORY COMPRESSION
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS compressed_summary TEXT;
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS compression_ratio NUMERIC;

-- 13. USER IDENTITY FINGERPRINTING
CREATE TABLE IF NOT EXISTS brain_user_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  preferred_topics TEXT[] DEFAULT '{}',
  communication_style TEXT DEFAULT 'neutral',
  complexity_preference TEXT DEFAULT 'medium',
  interaction_count INTEGER DEFAULT 0,
  avg_message_length INTEGER DEFAULT 0,
  sentiment_trend NUMERIC DEFAULT 0.0,
  timezone_hint TEXT,
  language_preference TEXT DEFAULT 'en',
  top_keywords TEXT[] DEFAULT '{}',
  personality_signals JSONB DEFAULT '{}',
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id)
);
ALTER TABLE brain_user_fingerprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fingerprints" ON brain_user_fingerprints FOR SELECT USING (true);
CREATE POLICY "Insert fingerprints" ON brain_user_fingerprints FOR INSERT WITH CHECK (true);
CREATE POLICY "Update fingerprints" ON brain_user_fingerprints FOR UPDATE USING (true);

-- 14. RAG PIPELINE tracking
CREATE TABLE IF NOT EXISTS brain_rag_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_id TEXT,
  query_text TEXT NOT NULL,
  recalled_memory_ids UUID[] DEFAULT '{}',
  recalled_tiers TEXT[] DEFAULT '{}',
  context_string TEXT,
  total_tokens INTEGER DEFAULT 0,
  was_useful BOOLEAN,
  response_quality NUMERIC,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE brain_rag_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rag" ON brain_rag_contexts FOR SELECT USING (true);
CREATE POLICY "Insert rag" ON brain_rag_contexts FOR INSERT WITH CHECK (true);

-- 15. AUDIT PROVENANCE
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT '{}';
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT '{}';
ALTER TABLE brain_memory_cold ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT '{}';
ALTER TABLE brain_memory_archive ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT '{}';

-- 10. METACOGNITIVE SELF-ASSESSMENT extensions
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS recall_accuracy NUMERIC DEFAULT 0.0;
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS avg_salience NUMERIC DEFAULT 0.5;
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS contradiction_count INTEGER DEFAULT 0;
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS compression_ratio NUMERIC DEFAULT 1.0;
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS retrieval_strategy TEXT DEFAULT 'balanced';
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS last_strategy_adjustment TIMESTAMPTZ;
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS peak_hours INTEGER[] DEFAULT '{}';
ALTER TABLE brain_memory_meta ADD COLUMN IF NOT EXISTS hourly_activity JSONB DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════════
-- VECTOR SIMILARITY SEARCH FUNCTION
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.vector_memory_search(
  p_user_id UUID,
  p_agent_id TEXT,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 10,
  p_min_similarity NUMERIC DEFAULT 0.7
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  memory_type TEXT,
  tier TEXT,
  similarity NUMERIC,
  value_score NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  (
    SELECT h.id, h.content, h.memory_type, 'hot'::TEXT AS tier,
           (1 - (h.embedding <=> p_query_embedding))::NUMERIC AS similarity,
           h.value_score, h.created_at
    FROM brain_memory_hot h
    WHERE h.user_id = p_user_id AND h.agent_id = p_agent_id
      AND h.embedding IS NOT NULL
      AND (1 - (h.embedding <=> p_query_embedding)) >= p_min_similarity
  )
  UNION ALL
  (
    SELECT w.id, w.content, w.memory_type, 'warm'::TEXT AS tier,
           (1 - (w.embedding <=> p_query_embedding))::NUMERIC AS similarity,
           w.value_score, w.created_at
    FROM brain_memory_warm w
    WHERE w.user_id = p_user_id AND w.agent_id = p_agent_id
      AND w.embedding IS NOT NULL
      AND (1 - (w.embedding <=> p_query_embedding)) >= p_min_similarity
  )
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- SM-2 SPACED REPETITION FUNCTION
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.sm2_update_memory(
  p_memory_id UUID,
  p_tier TEXT,
  p_quality INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_ease NUMERIC;
  v_interval INTEGER;
  v_review_count INTEGER;
BEGIN
  IF p_tier = 'hot' THEN
    SELECT ease_factor, repetition_interval_days, review_count
    INTO v_ease, v_interval, v_review_count
    FROM brain_memory_hot WHERE id = p_memory_id;
  ELSE
    SELECT ease_factor, repetition_interval_days, review_count
    INTO v_ease, v_interval, v_review_count
    FROM brain_memory_warm WHERE id = p_memory_id;
  END IF;

  IF p_quality >= 3 THEN
    IF v_review_count = 0 THEN v_interval := 1;
    ELSIF v_review_count = 1 THEN v_interval := 6;
    ELSE v_interval := CEIL(v_interval * v_ease);
    END IF;
    v_review_count := v_review_count + 1;
  ELSE
    v_review_count := 0;
    v_interval := 1;
  END IF;

  v_ease := GREATEST(1.3, v_ease + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02)));

  IF p_tier = 'hot' THEN
    UPDATE brain_memory_hot SET
      ease_factor = v_ease,
      repetition_interval_days = v_interval,
      review_count = v_review_count,
      next_review_at = now() + (v_interval || ' days')::INTERVAL,
      value_score = LEAST(1.0, value_score + 0.05)
    WHERE id = p_memory_id;
  ELSE
    UPDATE brain_memory_warm SET
      ease_factor = v_ease,
      repetition_interval_days = v_interval,
      review_count = v_review_count,
      next_review_at = now() + (v_interval || ' days')::INTERVAL,
      value_score = LEAST(1.0, value_score + 0.03)
    WHERE id = p_memory_id;
  END IF;

  RETURN jsonb_build_object(
    'ease_factor', v_ease,
    'interval_days', v_interval,
    'review_count', v_review_count,
    'next_review', now() + (v_interval || ' days')::INTERVAL
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- CONTRADICTION DETECTION FUNCTION
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.detect_memory_contradictions(
  p_user_id UUID,
  p_agent_id TEXT,
  p_new_content TEXT,
  p_new_memory_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_contradictions JSONB := '[]'::JSONB;
  v_existing RECORD;
BEGIN
  FOR v_existing IN
    SELECT id, content, 'hot' AS tier
    FROM brain_memory_hot
    WHERE user_id = p_user_id AND agent_id = p_agent_id
      AND memory_type IN ('user_fact', 'preference', 'identity')
      AND content % p_new_content
      AND id != p_new_memory_id
    LIMIT 5
  LOOP
    IF similarity(v_existing.content, p_new_content) BETWEEN 0.3 AND 0.85 THEN
      INSERT INTO brain_memory_contradictions (
        user_id, agent_id, memory_a_id, memory_a_content, memory_a_tier,
        memory_b_id, memory_b_content, memory_b_tier, confidence
      ) VALUES (
        p_user_id, p_agent_id, v_existing.id, v_existing.content, v_existing.tier,
        p_new_memory_id, p_new_content, 'hot',
        similarity(v_existing.content, p_new_content)
      );
      v_contradictions := v_contradictions || jsonb_build_object(
        'existing_id', v_existing.id, 'existing_content', v_existing.content,
        'similarity', similarity(v_existing.content, p_new_content)
      );
    END IF;
  END LOOP;

  UPDATE brain_memory_meta SET
    contradiction_count = contradiction_count + jsonb_array_length(v_contradictions)
  WHERE user_id = p_user_id AND agent_id = p_agent_id;

  RETURN jsonb_build_object('contradictions_found', jsonb_array_length(v_contradictions), 'details', v_contradictions);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- CONFIDENCE DECAY FUNCTION
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.apply_confidence_decay(p_user_id UUID, p_agent_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_decayed INTEGER := 0;
BEGIN
  UPDATE brain_memory_hot SET
    value_score = GREATEST(0.05, value_score - 0.05 * EXTRACT(DAY FROM now() - created_at))
  WHERE user_id = p_user_id AND agent_id = p_agent_id
    AND memory_type IN ('episodic', 'interaction')
    AND decay_curve = 'standard';
  GET DIAGNOSTICS v_decayed = ROW_COUNT;

  UPDATE brain_memory_hot SET
    value_score = GREATEST(0.1, value_score - 0.005 * EXTRACT(DAY FROM now() - created_at))
  WHERE user_id = p_user_id AND agent_id = p_agent_id
    AND memory_type IN ('semantic', 'user_fact')
    AND decay_curve = 'standard';

  UPDATE brain_memory_hot SET
    value_score = GREATEST(0.15, value_score - 0.002 * EXTRACT(DAY FROM now() - created_at))
  WHERE user_id = p_user_id AND agent_id = p_agent_id
    AND memory_type IN ('procedural', 'preference')
    AND decay_curve = 'standard';

  UPDATE brain_memory_warm SET
    value_score = GREATEST(0.02, value_score * CASE
      WHEN memory_type IN ('episodic', 'interaction') THEN 0.95
      WHEN memory_type IN ('semantic', 'user_fact') THEN 0.995
      WHEN memory_type IN ('procedural', 'preference') THEN 0.998
      ELSE 0.99
    END)
  WHERE user_id = p_user_id AND agent_id = p_agent_id;

  RETURN jsonb_build_object('decayed_memories', v_decayed);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- MEMORY COMPRESSION FUNCTION
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.compress_warm_memories(p_user_id UUID, p_agent_id TEXT, p_max_words INTEGER DEFAULT 50)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_compressed INTEGER := 0;
  v_mem RECORD;
BEGIN
  FOR v_mem IN
    SELECT id, content FROM brain_memory_warm
    WHERE user_id = p_user_id AND agent_id = p_agent_id
      AND compressed_summary IS NULL
      AND array_length(string_to_array(content, ' '), 1) > p_max_words
    LIMIT 50
  LOOP
    UPDATE brain_memory_warm SET
      compressed_summary = array_to_string(
        (string_to_array(content, ' '))[1:p_max_words], ' '
      ) || '...',
      compression_ratio = p_max_words::NUMERIC / GREATEST(1, array_length(string_to_array(content, ' '), 1))
    WHERE id = v_mem.id;
    v_compressed := v_compressed + 1;
  END LOOP;

  UPDATE brain_memory_meta SET
    compression_ratio = (
      SELECT AVG(compression_ratio) FROM brain_memory_warm
      WHERE user_id = p_user_id AND agent_id = p_agent_id AND compression_ratio IS NOT NULL
    )
  WHERE user_id = p_user_id AND agent_id = p_agent_id;

  RETURN jsonb_build_object('compressed', v_compressed);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- USER FINGERPRINT UPDATE
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_user_fingerprint(
  p_user_id UUID,
  p_agent_id TEXT,
  p_message_length INTEGER,
  p_keywords TEXT[] DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO brain_user_fingerprints (user_id, agent_id, interaction_count, avg_message_length, top_keywords, last_seen_at)
  VALUES (p_user_id, p_agent_id, 1, p_message_length, p_keywords, now())
  ON CONFLICT (user_id, agent_id) DO UPDATE SET
    interaction_count = brain_user_fingerprints.interaction_count + 1,
    avg_message_length = (
      brain_user_fingerprints.avg_message_length * brain_user_fingerprints.interaction_count + p_message_length
    ) / (brain_user_fingerprints.interaction_count + 1),
    top_keywords = (
      SELECT ARRAY(
        SELECT DISTINCT unnest(brain_user_fingerprints.top_keywords || p_keywords)
        LIMIT 50
      )
    ),
    last_seen_at = now(),
    updated_at = now();
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- METACOGNITIVE SELF-ASSESSMENT
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.run_metacognitive_assessment(p_user_id UUID, p_agent_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_meta RECORD;
  v_strategy TEXT;
BEGIN
  SELECT * INTO v_meta FROM brain_memory_meta
  WHERE user_id = p_user_id AND agent_id = p_agent_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'no_data');
  END IF;

  IF v_meta.recall_hit_rate > 0.8 THEN
    v_strategy := 'precision';
  ELSIF v_meta.recall_hit_rate > 0.5 THEN
    v_strategy := 'balanced';
  ELSE
    v_strategy := 'exploration';
  END IF;

  UPDATE brain_memory_meta SET
    retrieval_strategy = v_strategy,
    recall_accuracy = v_meta.recall_hit_rate,
    avg_salience = COALESCE((
      SELECT AVG(salience_score) FROM brain_memory_hot
      WHERE user_id = p_user_id AND agent_id = p_agent_id
    ), 0.5),
    last_strategy_adjustment = now(),
    updated_at = now()
  WHERE user_id = p_user_id AND agent_id = p_agent_id;

  RETURN jsonb_build_object(
    'strategy', v_strategy,
    'recall_rate', v_meta.recall_hit_rate,
    'hot_count', v_meta.hot_count,
    'contradiction_count', v_meta.contradiction_count,
    'compression_ratio', v_meta.compression_ratio
  );
END;
$$;
