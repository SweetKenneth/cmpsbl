
-- Add lineage provenance columns to brain memory tiers
ALTER TABLE brain_memory_hot
  ADD COLUMN IF NOT EXISTS source_events jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS derived_from jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS generation integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lineage_confidence numeric DEFAULT 1.0;

ALTER TABLE brain_memory_warm
  ADD COLUMN IF NOT EXISTS source_events jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS derived_from jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS generation integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lineage_confidence numeric DEFAULT 1.0;

ALTER TABLE brain_memory_cold
  ADD COLUMN IF NOT EXISTS source_events jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS derived_from jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS generation integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lineage_confidence numeric DEFAULT 1.0;

-- Index generation for efficient filtering during dream cycles
CREATE INDEX IF NOT EXISTS idx_brain_memory_hot_generation ON brain_memory_hot(generation);
CREATE INDEX IF NOT EXISTS idx_brain_memory_warm_generation ON brain_memory_warm(generation);
CREATE INDEX IF NOT EXISTS idx_brain_memory_cold_generation ON brain_memory_cold(generation);
