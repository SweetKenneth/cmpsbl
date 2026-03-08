
-- Add source_module and category columns to hot/warm/cold memory tables
-- These are needed by the distillation engine to cluster memories for crystal creation

ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS source_module text DEFAULT 'general';
ALTER TABLE brain_memory_hot ADD COLUMN IF NOT EXISTS category text DEFAULT 'uncategorized';

ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS source_module text DEFAULT 'general';
ALTER TABLE brain_memory_warm ADD COLUMN IF NOT EXISTS category text DEFAULT 'uncategorized';

ALTER TABLE brain_memory_cold ADD COLUMN IF NOT EXISTS source_module text DEFAULT 'general';
ALTER TABLE brain_memory_cold ADD COLUMN IF NOT EXISTS category text DEFAULT 'uncategorized';

-- Create indexes for distillation clustering queries
CREATE INDEX IF NOT EXISTS idx_hot_source_module_category ON brain_memory_hot(source_module, category);
CREATE INDEX IF NOT EXISTS idx_warm_source_module_category ON brain_memory_warm(source_module, category);
CREATE INDEX IF NOT EXISTS idx_cold_source_module_category ON brain_memory_cold(source_module, category);
