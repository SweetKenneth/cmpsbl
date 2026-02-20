
-- ============================================================
-- MEMORY TIER UPGRADE: Per-agent + per-user scoping, adaptive capacity, metacognition
-- ============================================================

-- 1. Add user_id and agent_id columns to all memory tiers
ALTER TABLE public.brain_memory_hot 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS agent_id TEXT,
  ADD COLUMN IF NOT EXISTS memory_type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS salience_score NUMERIC DEFAULT 0.5;

ALTER TABLE public.brain_memory_warm 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS agent_id TEXT,
  ADD COLUMN IF NOT EXISTS memory_type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS salience_score NUMERIC DEFAULT 0.5;

ALTER TABLE public.brain_memory_cold 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS agent_id TEXT,
  ADD COLUMN IF NOT EXISTS memory_type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS salience_score NUMERIC DEFAULT 0.5;

-- 2. Create archive tier (never delete, just compress)
CREATE TABLE IF NOT EXISTS public.brain_memory_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_tier TEXT NOT NULL, -- which tier it came from
  source_memory_id UUID,
  user_id UUID,
  agent_id TEXT,
  content TEXT NOT NULL,
  core_summary TEXT,
  memory_type TEXT DEFAULT 'general',
  context TEXT,
  tags JSONB,
  metadata JSONB,
  value_score NUMERIC DEFAULT 0,
  access_count INTEGER DEFAULT 0,
  salience_score NUMERIC DEFAULT 0,
  archived_from_tier TEXT,
  archived_reason TEXT, -- 'capacity_limit', 'decay', 'manual'
  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Memory metacognition table — brain knows its own state
CREATE TABLE IF NOT EXISTS public.brain_memory_meta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_id TEXT,
  -- Per-user tier stats
  hot_count INTEGER DEFAULT 0,
  warm_count INTEGER DEFAULT 0,
  cold_count INTEGER DEFAULT 0,
  archive_count INTEGER DEFAULT 0,
  -- Adaptive limits (scale with usage)
  hot_limit INTEGER DEFAULT 200,
  warm_limit INTEGER DEFAULT 2000,
  cold_limit INTEGER DEFAULT 20000,
  -- Metacognitive metrics
  recall_hit_rate NUMERIC DEFAULT 0, -- % of recalls that returned relevant results
  avg_salience NUMERIC DEFAULT 0.5,
  total_stores INTEGER DEFAULT 0,
  total_recalls INTEGER DEFAULT 0,
  promotions INTEGER DEFAULT 0,
  demotions INTEGER DEFAULT 0,
  last_tiering_run TIMESTAMPTZ,
  last_metacognition_update TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- 4. Indexes for per-user + per-agent lookups
CREATE INDEX IF NOT EXISTS idx_brain_hot_user_agent ON public.brain_memory_hot(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_brain_warm_user_agent ON public.brain_memory_warm(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_brain_cold_user_agent ON public.brain_memory_cold(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_brain_archive_user_agent ON public.brain_memory_archive(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_brain_hot_salience ON public.brain_memory_hot(salience_score DESC);
CREATE INDEX IF NOT EXISTS idx_brain_warm_salience ON public.brain_memory_warm(salience_score DESC);

-- 5. Adaptive capacity function — scales limits based on usage
CREATE OR REPLACE FUNCTION public.get_adaptive_memory_limits(p_user_id UUID, p_agent_id TEXT)
RETURNS TABLE(hot_limit INT, warm_limit INT, cold_limit INT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_recalls INTEGER;
  v_recall_rate NUMERIC;
  v_activity_multiplier NUMERIC;
BEGIN
  -- Get current meta
  SELECT m.total_recalls, m.recall_hit_rate
  INTO v_total_recalls, v_recall_rate
  FROM brain_memory_meta m
  WHERE m.user_id = p_user_id AND m.agent_id = p_agent_id;

  IF NOT FOUND THEN
    -- Default limits for new users
    RETURN QUERY SELECT 200, 2000, 20000;
    RETURN;
  END IF;

  -- Activity multiplier: more active users get more hot slots
  -- Base: 200, max: 2000 hot slots
  v_activity_multiplier := LEAST(10.0, GREATEST(1.0, 
    1.0 + LN(GREATEST(1, v_total_recalls)) * 0.5
  ));

  -- High recall rate = user benefits from more hot memory
  IF v_recall_rate > 0.7 THEN
    v_activity_multiplier := v_activity_multiplier * 1.5;
  END IF;

  hot_limit := LEAST(2000, GREATEST(200, (200 * v_activity_multiplier)::INT));
  warm_limit := LEAST(20000, GREATEST(2000, (2000 * v_activity_multiplier)::INT));
  cold_limit := LEAST(200000, GREATEST(20000, (20000 * v_activity_multiplier)::INT));
  
  RETURN NEXT;
END;
$$;

-- 6. Salience gate — decides whether incoming content is worth storing in hot
CREATE OR REPLACE FUNCTION public.calculate_memory_salience(
  p_content TEXT,
  p_memory_type TEXT,
  p_user_id UUID,
  p_agent_id TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_salience NUMERIC := 0.5;
  v_word_count INTEGER;
  v_has_user_fact BOOLEAN;
  v_duplicate_count INTEGER;
BEGIN
  -- Word count factor (very short = low salience, medium = high)
  v_word_count := array_length(string_to_array(trim(p_content), ' '), 1);
  IF v_word_count < 3 THEN v_salience := v_salience - 0.2;
  ELSIF v_word_count BETWEEN 5 AND 50 THEN v_salience := v_salience + 0.1;
  END IF;

  -- Memory type boost
  IF p_memory_type IN ('user_fact', 'preference', 'identity') THEN
    v_salience := v_salience + 0.3; -- User facts are always high salience
  ELSIF p_memory_type IN ('workload_outcome', 'task_result') THEN
    v_salience := v_salience + 0.15;
  END IF;

  -- Dedup check: similar content already in hot?
  SELECT COUNT(*) INTO v_duplicate_count
  FROM brain_memory_hot
  WHERE user_id = p_user_id 
    AND agent_id = p_agent_id
    AND content % p_content; -- trigram similarity

  IF v_duplicate_count > 0 THEN
    v_salience := v_salience - 0.4; -- Heavy penalty for dupes
  END IF;

  RETURN LEAST(1.0, GREATEST(0.0, v_salience));
END;
$$;

-- 7. Non-destructive tiering cascade function
CREATE OR REPLACE FUNCTION public.run_memory_tiering(p_user_id UUID, p_agent_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_hot_limit INTEGER;
  v_warm_limit INTEGER;
  v_cold_limit INTEGER;
  v_hot_count INTEGER;
  v_warm_count INTEGER;
  v_cold_count INTEGER;
  v_demoted_hot INTEGER := 0;
  v_demoted_warm INTEGER := 0;
  v_archived INTEGER := 0;
  v_promoted INTEGER := 0;
BEGIN
  -- Get adaptive limits
  SELECT * INTO v_hot_limit, v_warm_limit, v_cold_limit
  FROM get_adaptive_memory_limits(p_user_id, p_agent_id);

  -- Count current entries
  SELECT COUNT(*) INTO v_hot_count FROM brain_memory_hot WHERE user_id = p_user_id AND agent_id = p_agent_id;
  SELECT COUNT(*) INTO v_warm_count FROM brain_memory_warm WHERE user_id = p_user_id AND agent_id = p_agent_id;
  SELECT COUNT(*) INTO v_cold_count FROM brain_memory_cold WHERE user_id = p_user_id AND agent_id = p_agent_id;

  -- PROMOTE: High-value warm → hot (if hot has capacity)
  IF v_hot_count < v_hot_limit * 0.9 THEN
    WITH promoted AS (
      DELETE FROM brain_memory_warm
      WHERE id IN (
        SELECT id FROM brain_memory_warm
        WHERE user_id = p_user_id AND agent_id = p_agent_id
          AND value_score > 0.8 AND access_count > 3
        ORDER BY value_score DESC
        LIMIT LEAST(20, v_hot_limit - v_hot_count)
      )
      RETURNING *
    )
    INSERT INTO brain_memory_hot (content, context, embedding, user_id, agent_id, memory_type, value_score, access_count, salience_score, tags, metadata, created_at)
    SELECT content, context, embedding, user_id, agent_id, memory_type, value_score, access_count, salience_score, tags, metadata, created_at
    FROM promoted;
    
    GET DIAGNOSTICS v_promoted = ROW_COUNT;
  END IF;

  -- DEMOTE HOT: Lowest value hot → warm (when over limit)
  IF v_hot_count > v_hot_limit THEN
    WITH demoted AS (
      DELETE FROM brain_memory_hot
      WHERE id IN (
        SELECT id FROM brain_memory_hot
        WHERE user_id = p_user_id AND agent_id = p_agent_id
        ORDER BY value_score ASC, last_used ASC NULLS FIRST
        LIMIT (v_hot_count - (v_hot_limit * 0.85)::INT)
      )
      RETURNING *
    )
    INSERT INTO brain_memory_warm (content, context, embedding, user_id, agent_id, memory_type, value_score, access_count, salience_score, decay_rate, tags, metadata, created_at, demoted_at)
    SELECT content, context, embedding, user_id, agent_id, memory_type, value_score, access_count, salience_score, 0.05, tags, metadata, created_at, now()
    FROM demoted;
    
    GET DIAGNOSTICS v_demoted_hot = ROW_COUNT;
  END IF;

  -- DEMOTE WARM → COLD (when over limit)
  IF v_warm_count > v_warm_limit THEN
    WITH demoted AS (
      DELETE FROM brain_memory_warm
      WHERE id IN (
        SELECT id FROM brain_memory_warm
        WHERE user_id = p_user_id AND agent_id = p_agent_id
        ORDER BY value_score ASC, last_accessed ASC NULLS FIRST
        LIMIT (v_warm_count - (v_warm_limit * 0.85)::INT)
      )
      RETURNING *
    )
    INSERT INTO brain_memory_cold (content, core_summary, embedding, user_id, agent_id, memory_type, context, value_score, access_count, salience_score, decay_rate, source_memory_id, tags, metadata, created_at, demoted_at)
    SELECT content, core_summary, embedding, user_id, agent_id, memory_type, context, value_score, access_count, salience_score, 0.1, id, tags, metadata, created_at, now()
    FROM demoted;
    
    GET DIAGNOSTICS v_demoted_warm = ROW_COUNT;
  END IF;

  -- ARCHIVE COLD (never delete — move to archive when over limit)
  IF v_cold_count > v_cold_limit THEN
    WITH to_archive AS (
      DELETE FROM brain_memory_cold
      WHERE id IN (
        SELECT id FROM brain_memory_cold
        WHERE user_id = p_user_id AND agent_id = p_agent_id
        ORDER BY value_score ASC, last_accessed ASC NULLS FIRST
        LIMIT (v_cold_count - (v_cold_limit * 0.85)::INT)
      )
      RETURNING *
    )
    INSERT INTO brain_memory_archive (source_tier, source_memory_id, user_id, agent_id, content, core_summary, memory_type, context, tags, metadata, value_score, access_count, salience_score, archived_from_tier, archived_reason)
    SELECT 'cold', id, user_id, agent_id, content, core_summary, memory_type, context, tags, metadata, value_score, access_count, salience_score, 'cold', 'capacity_limit'
    FROM to_archive;
    
    GET DIAGNOSTICS v_archived = ROW_COUNT;
  END IF;

  -- Update metacognition
  INSERT INTO brain_memory_meta (user_id, agent_id, hot_count, warm_count, cold_count, archive_count, hot_limit, warm_limit, cold_limit, demotions, promotions, last_tiering_run)
  VALUES (p_user_id, p_agent_id,
    v_hot_count - v_demoted_hot + v_promoted,
    v_warm_count + v_demoted_hot - v_demoted_warm - v_promoted,
    v_cold_count + v_demoted_warm - v_archived,
    v_archived,
    v_hot_limit, v_warm_limit, v_cold_limit,
    v_demoted_hot + v_demoted_warm, v_promoted, now()
  )
  ON CONFLICT (user_id, agent_id) DO UPDATE SET
    hot_count = EXCLUDED.hot_count,
    warm_count = EXCLUDED.warm_count,
    cold_count = EXCLUDED.cold_count,
    archive_count = brain_memory_meta.archive_count + EXCLUDED.archive_count,
    hot_limit = EXCLUDED.hot_limit,
    warm_limit = EXCLUDED.warm_limit,
    cold_limit = EXCLUDED.cold_limit,
    demotions = brain_memory_meta.demotions + EXCLUDED.demotions,
    promotions = brain_memory_meta.promotions + EXCLUDED.promotions,
    last_tiering_run = now(),
    last_metacognition_update = now(),
    updated_at = now();

  RETURN jsonb_build_object(
    'promoted', v_promoted,
    'demoted_hot', v_demoted_hot,
    'demoted_warm', v_demoted_warm,
    'archived', v_archived,
    'limits', jsonb_build_object('hot', v_hot_limit, 'warm', v_warm_limit, 'cold', v_cold_limit)
  );
END;
$$;

-- 8. Update metacognition on recall
CREATE OR REPLACE FUNCTION public.track_memory_recall(p_user_id UUID, p_agent_id TEXT, p_hit BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO brain_memory_meta (user_id, agent_id, total_recalls, recall_hit_rate)
  VALUES (p_user_id, p_agent_id, 1, CASE WHEN p_hit THEN 1.0 ELSE 0.0 END)
  ON CONFLICT (user_id, agent_id) DO UPDATE SET
    total_recalls = brain_memory_meta.total_recalls + 1,
    recall_hit_rate = (
      brain_memory_meta.recall_hit_rate * brain_memory_meta.total_recalls + 
      CASE WHEN p_hit THEN 1.0 ELSE 0.0 END
    ) / (brain_memory_meta.total_recalls + 1),
    last_metacognition_update = now(),
    updated_at = now();
END;
$$;

-- 9. RLS for archive and meta tables
ALTER TABLE public.brain_memory_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_memory_meta ENABLE ROW LEVEL SECURITY;

-- Archive: public read (showcase), admin write
CREATE POLICY "Public read brain_memory_archive" ON public.brain_memory_archive FOR SELECT USING (true);
CREATE POLICY "Admin write brain_memory_archive" ON public.brain_memory_archive FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Meta: public read, admin write
CREATE POLICY "Public read brain_memory_meta" ON public.brain_memory_meta FOR SELECT USING (true);
CREATE POLICY "Admin write brain_memory_meta" ON public.brain_memory_meta FOR ALL USING (public.has_role(auth.uid(), 'admin'));
