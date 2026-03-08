
-- Drop and recreate with source_module/category support
DROP FUNCTION IF EXISTS brain_bulk_demote_hot_to_warm(integer);
DROP FUNCTION IF EXISTS brain_bulk_demote_warm_to_cold(integer);

CREATE FUNCTION brain_bulk_demote_hot_to_warm(batch_size INT DEFAULT 500)
RETURNS INT
LANGUAGE plpgsql
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
    INSERT INTO brain_memory_warm (content, context, priority, access_count, memory_type, value_score, tags, metadata, demoted_at, user_id, agent_id, salience_score, generation, lineage_confidence, source_module, category)
    SELECT h.content, h.context, GREATEST(1, COALESCE(h.priority, 5) - 2), COALESCE(h.access_count, 0),
           COALESCE(h.memory_type, 'general'), COALESCE(h.value_score, 0.3), h.tags,
           COALESCE(h.metadata, '{}'::jsonb) || jsonb_build_object('demoted_from', 'hot', 'demoted_at', now()),
           now(), h.user_id, h.agent_id, h.salience_score, h.generation, h.lineage_confidence,
           COALESCE(h.source_module, 'general'), COALESCE(h.category, 'uncategorized')
    FROM brain_memory_hot h
    INNER JOIN candidates c ON c.id = h.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO moved FROM inserted;

  DELETE FROM brain_memory_hot WHERE id IN (SELECT id FROM brain_memory_hot ORDER BY value_score ASC, access_count ASC, created_at ASC LIMIT batch_size);

  RETURN moved;
END;
$$;

CREATE FUNCTION brain_bulk_demote_warm_to_cold(batch_size INT DEFAULT 500)
RETURNS INT
LANGUAGE plpgsql
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
    INSERT INTO brain_memory_cold (summary, core_summary, access_count, memory_type, value_score, tags, user_id, agent_id, salience_score, generation, lineage_confidence, source_module, category)
    SELECT w.content, COALESCE(w.core_summary, LEFT(w.content, 200)), COALESCE(w.access_count, 0),
           COALESCE(w.memory_type, 'general'), COALESCE(w.value_score, 0.1), w.tags,
           w.user_id, w.agent_id, w.salience_score, w.generation, w.lineage_confidence,
           COALESCE(w.source_module, 'general'), COALESCE(w.category, 'uncategorized')
    FROM brain_memory_warm w
    INNER JOIN candidates c ON c.id = w.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO moved FROM inserted;

  DELETE FROM brain_memory_warm WHERE id IN (SELECT id FROM brain_memory_warm ORDER BY value_score ASC, access_count ASC, created_at ASC LIMIT batch_size);

  RETURN moved;
END;
$$;
