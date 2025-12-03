-- ========================================
-- CASCADE DATA EXPORT TEMPLATE
-- ========================================
-- Use this template to export your Cascade data
-- Run these queries in your CURRENT project to get the data
-- Then use the INSERT statements in your NEW project

-- ========================================
-- STEP 1: EXPORT CURRENT DATA
-- ========================================
-- Run these queries in your current project's SQL editor
-- Copy the results to use in the INSERT statements below

-- Export cascade_knowledge_core
-- SELECT * FROM public.cascade_knowledge_core ORDER BY created_at;

-- Export cascade_memory_anchors
-- SELECT * FROM public.cascade_memory_anchors ORDER BY created_at;

-- Export cascade_objectives
-- SELECT * FROM public.cascade_objectives ORDER BY created_at;

-- Export cascade_thoughts
-- SELECT * FROM public.cascade_thoughts ORDER BY created_at;

-- Export cascade_dreams (if you want to migrate user dreams)
-- SELECT * FROM public.cascade_dreams ORDER BY created_at;

-- ========================================
-- STEP 2: IMPORT TO NEW PROJECT
-- ========================================
-- After running the schema script (01-schema-export.sql),
-- use these templates to insert your data

-- Example: Insert knowledge core entries
-- INSERT INTO public.cascade_knowledge_core 
--   (id, topic, content, confidence, status, tags, metadata, created_at)
-- VALUES
--   ('uuid-here', 'topic', 'content', 0.8, 'active', '[]'::jsonb, '{}'::jsonb, now());

-- Example: Insert memory anchors
-- INSERT INTO public.cascade_memory_anchors
--   (id, anchor_text, memory_type, importance_score, context, tags, metadata, created_at)
-- VALUES
--   ('uuid-here', 'anchor text', 'core', 0.9, 'context', '[]'::jsonb, '{}'::jsonb, now());

-- Example: Insert objectives
-- INSERT INTO public.cascade_objectives
--   (id, objective, status, priority, completion_percentage, metadata, created_at, updated_at)
-- VALUES
--   ('uuid-here', 'objective text', 'active', 5, 0, '{}'::jsonb, now(), now());

-- ========================================
-- ALTERNATIVE: Use JSON export/import
-- ========================================
-- For easier data migration, export as JSON and reimport

-- Export to JSON (run in current project):
-- COPY (
--   SELECT json_agg(t) FROM cascade_knowledge_core t
-- ) TO '/tmp/cascade_knowledge.json';

-- Import from JSON (run in new project):
-- INSERT INTO public.cascade_knowledge_core
-- SELECT * FROM json_populate_recordset(NULL::cascade_knowledge_core, 
--   '[paste-json-here]'::json);
