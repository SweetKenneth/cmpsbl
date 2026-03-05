
-- Add fingerprint and rediscovery columns to discoveries
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS pipeline_fingerprint TEXT UNIQUE;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS discovery_count INTEGER DEFAULT 1;
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS last_discovered_at TIMESTAMPTZ DEFAULT now();

-- Index for fast fingerprint lookup
CREATE INDEX IF NOT EXISTS idx_discoveries_fingerprint ON discoveries(pipeline_fingerprint);

-- Add fingerprint to foundry_inventory
ALTER TABLE foundry_inventory ADD COLUMN IF NOT EXISTS pipeline_fingerprint TEXT;

-- Create discovery metrics table
CREATE TABLE IF NOT EXISTS foundry_discovery_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_fingerprint TEXT NOT NULL UNIQUE,
  pipeline_name TEXT NOT NULL,
  total_discoveries INTEGER DEFAULT 1,
  total_mine_events INTEGER DEFAULT 0,
  dfi NUMERIC(10,8) DEFAULT 0,
  first_discovered_at TIMESTAMPTZ DEFAULT now(),
  last_discovered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discovery_metrics_fingerprint ON foundry_discovery_metrics(pipeline_fingerprint);

-- Enable RLS
ALTER TABLE foundry_discovery_metrics ENABLE ROW LEVEL SECURITY;

-- Public read for discovery metrics (global stats)
CREATE POLICY "Anyone can read discovery metrics" ON foundry_discovery_metrics FOR SELECT USING (true);

-- Backfill fingerprints for existing discoveries using md5 (will be replaced by proper SHA-256 from edge function)
UPDATE discoveries 
SET pipeline_fingerprint = md5(
  COALESCE(name, '') || '::' || 
  COALESCE(array_to_string(module_chain, ','), '') || '::' || 
  COALESCE(cjpi::text, '0') || '::' || 
  COALESCE(category, '')
),
last_discovered_at = COALESCE(created_at, now())
WHERE pipeline_fingerprint IS NULL;
