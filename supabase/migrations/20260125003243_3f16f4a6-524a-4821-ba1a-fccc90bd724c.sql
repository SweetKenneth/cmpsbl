-- =========================================================
-- BRAIN MODULE REPAIR v2026.01.25
-- Fix: Remove erroneous unique constraint on memory_type
-- =========================================================

-- 1. Drop the incorrect unique constraint that prevents multiple memories of same type
ALTER TABLE public.brain_memories DROP CONSTRAINT IF EXISTS brain_memories_memory_type_key;

-- 2. Add FTS index for brain.query if not exists (improves textSearch performance)
DROP INDEX IF EXISTS idx_brain_memories_content_fts;
CREATE INDEX idx_brain_memories_content_fts ON public.brain_memories USING GIN (to_tsvector('english', content));

-- 3. Also add FTS for brain_memory_hot for recall action
DROP INDEX IF EXISTS idx_brain_memory_hot_content_fts;
CREATE INDEX idx_brain_memory_hot_content_fts ON public.brain_memory_hot USING GIN (to_tsvector('english', content));

-- 4. Add created_at index for brain_graph_edges to support recent_connections query
DROP INDEX IF EXISTS idx_brain_graph_edges_created_at;
CREATE INDEX idx_brain_graph_edges_created_at ON public.brain_graph_edges (created_at DESC);

-- Log repair event
INSERT INTO brain_events (event_type, module, outcome, data)
VALUES ('brain_repair_migration', 'brain', 'success', '{"version": "2026.01.25", "fixes": ["removed unique constraint on memory_type", "added FTS indexes", "added graph edges created_at index"]}');