
-- Bulk demote hot → warm: moves the N lowest-value hot entries to warm
CREATE OR REPLACE FUNCTION public.brain_bulk_demote_hot_to_warm(batch_size INT DEFAULT 1000)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moved INT := 0;
BEGIN
  WITH candidates AS (
    SELECT id FROM brain_memory_hot
    ORDER BY value_score ASC, access_count ASC, created_at ASC
    LIMIT batch_size
  ),
  inserted AS (
    INSERT INTO brain_memory_warm (content, context, priority, access_count, memory_type, value_score, tags, metadata, demoted_at, user_id, agent_id, salience_score, generation, lineage_confidence)
    SELECT h.content, h.context, GREATEST(1, COALESCE(h.priority, 5) - 2), COALESCE(h.access_count, 0),
           COALESCE(h.memory_type, 'general'), COALESCE(h.value_score, 0.3), h.tags,
           COALESCE(h.metadata, '{}'::jsonb) || jsonb_build_object('demoted_from', 'hot', 'demoted_at', now()),
           now(), h.user_id, h.agent_id, h.salience_score, h.generation, h.lineage_confidence
    FROM brain_memory_hot h
    INNER JOIN candidates c ON c.id = h.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO moved FROM inserted;

  DELETE FROM brain_memory_hot WHERE id IN (SELECT id FROM brain_memory_hot ORDER BY value_score ASC, access_count ASC, created_at ASC LIMIT batch_size);

  RETURN moved;
END;
$$;

-- Bulk demote warm → cold
CREATE OR REPLACE FUNCTION public.brain_bulk_demote_warm_to_cold(batch_size INT DEFAULT 1000)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moved INT := 0;
BEGIN
  WITH candidates AS (
    SELECT id FROM brain_memory_warm
    ORDER BY value_score ASC, access_count ASC, created_at ASC
    LIMIT batch_size
  ),
  inserted AS (
    INSERT INTO brain_memory_cold (summary, core_summary, access_count, memory_type, value_score, tags, user_id, agent_id, salience_score, generation, lineage_confidence)
    SELECT w.content, COALESCE(w.core_summary, LEFT(w.content, 200)), COALESCE(w.access_count, 0),
           COALESCE(w.memory_type, 'general'), COALESCE(w.value_score, 0.1), w.tags,
           w.user_id, w.agent_id, w.salience_score, w.generation, w.lineage_confidence
    FROM brain_memory_warm w
    INNER JOIN candidates c ON c.id = w.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO moved FROM inserted;

  DELETE FROM brain_memory_warm WHERE id IN (SELECT id FROM brain_memory_warm ORDER BY value_score ASC, access_count ASC, created_at ASC LIMIT batch_size);

  RETURN moved;
END;
$$;

-- Bulk prune cold → pruned archive
CREATE OR REPLACE FUNCTION public.brain_bulk_prune_cold(batch_size INT DEFAULT 1000, keep_count INT DEFAULT 5000)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INT;
  to_prune INT;
  pruned INT := 0;
BEGIN
  SELECT COUNT(*) INTO current_count FROM brain_memory_cold;
  to_prune := LEAST(batch_size, GREATEST(0, current_count - keep_count));
  
  IF to_prune <= 0 THEN RETURN 0; END IF;

  WITH candidates AS (
    SELECT id FROM brain_memory_cold
    ORDER BY value_score ASC, access_count ASC, created_at ASC
    LIMIT to_prune
  ),
  archived AS (
    INSERT INTO brain_memory_pruned (original_memory_id, original_tier, content_preview, value_score, prune_reason, pruned_at, can_restore, restore_until)
    SELECT c2.id, 'cold', LEFT(c2.summary, 200), c2.value_score, 'auto_prune_overflow', now(), true, now() + interval '7 days'
    FROM brain_memory_cold c2
    INNER JOIN candidates c ON c.id = c2.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO pruned FROM archived;

  DELETE FROM brain_memory_cold WHERE id IN (SELECT id FROM brain_memory_cold ORDER BY value_score ASC, access_count ASC, created_at ASC LIMIT to_prune);

  RETURN pruned;
END;
$$;

-- Expire old pruned records (cleanup)
CREATE OR REPLACE FUNCTION public.brain_cleanup_expired_pruned()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INT;
BEGIN
  DELETE FROM brain_memory_pruned WHERE restore_until < now() AND can_restore = true;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

-- Get tier counts efficiently
CREATE OR REPLACE FUNCTION public.brain_get_tier_counts()
RETURNS TABLE(tier TEXT, cnt BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'hot'::TEXT, COUNT(*) FROM brain_memory_hot
  UNION ALL
  SELECT 'warm'::TEXT, COUNT(*) FROM brain_memory_warm
  UNION ALL
  SELECT 'cold'::TEXT, COUNT(*) FROM brain_memory_cold
  UNION ALL
  SELECT 'flat'::TEXT, COUNT(*) FROM brain_memories
  UNION ALL
  SELECT 'pruned'::TEXT, COUNT(*) FROM brain_memory_pruned;
$$;
