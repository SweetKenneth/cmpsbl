-- ══════════════════════════════════════════════════════════════════════
-- promptfluid® Substrate OS — CORE, RIPPLE, ACCESS Modules
-- Phase 1-3 Database Schema for Complete AI Operating System
-- ══════════════════════════════════════════════════════════════════════

-- ═══ CORE MODULE (The Kernel) ═══

-- Job scheduler
CREATE TABLE IF NOT EXISTS core_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  result JSONB,
  created_by TEXT,
  execution_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System state machine
CREATE TABLE IF NOT EXISTS core_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL DEFAULT 'running' CHECK (state IN ('booting', 'running', 'degraded', 'maintenance', 'shutdown')),
  modules_status JSONB DEFAULT '{}',
  boot_sequence JSONB DEFAULT '[]',
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  uptime_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Execution contexts (sandboxing)
CREATE TABLE IF NOT EXISTS core_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID,
  developer_id TEXT,
  permissions JSONB DEFAULT '[]',
  rate_limit_remaining INTEGER DEFAULT 1000,
  tokens_remaining INTEGER DEFAULT 100000,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '1 hour',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- System configuration
CREATE TABLE IF NOT EXISTS core_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT DEFAULT 'system',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ RIPPLE MODULE (Message Bus) ═══

-- Job queues
CREATE TABLE IF NOT EXISTS ripple_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_log JSONB DEFAULT '[]',
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pub/sub topics
CREATE TABLE IF NOT EXISTS ripple_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS ripple_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES ripple_topics(id) ON DELETE CASCADE,
  subscriber_module TEXT NOT NULL,
  subscriber_action TEXT NOT NULL,
  filter_conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event log (event sourcing)
CREATE TABLE IF NOT EXISTS ripple_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  publisher_module TEXT,
  correlation_id UUID,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ ACCESS MODULE (Identity & Billing) ═══

-- API Keys with scopes
CREATE TABLE IF NOT EXISTS access_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT,
  scopes TEXT[] DEFAULT '{}',
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage metering
CREATE TABLE IF NOT EXISTS access_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES access_api_keys(id) ON DELETE SET NULL,
  developer_id UUID,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  compute_ms INTEGER DEFAULT 0,
  cost_millicents INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily quota tracking
CREATE TABLE IF NOT EXISTS access_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES access_api_keys(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calls_used INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_millicents INTEGER DEFAULT 0,
  UNIQUE(api_key_id, date)
);

-- Subscriptions/tiers
CREATE TABLE IF NOT EXISTS access_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_quota INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ INDEXES ═══
CREATE INDEX IF NOT EXISTS idx_core_jobs_status ON core_jobs(status);
CREATE INDEX IF NOT EXISTS idx_core_jobs_scheduled ON core_jobs(scheduled_at) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_core_jobs_module ON core_jobs(module, action);
CREATE INDEX IF NOT EXISTS idx_ripple_jobs_queue ON ripple_jobs(queue_name, status);
CREATE INDEX IF NOT EXISTS idx_ripple_jobs_scheduled ON ripple_jobs(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_ripple_events_topic ON ripple_events(topic, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ripple_events_unprocessed ON ripple_events(topic) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_access_usage_api_key ON access_usage(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_usage_developer ON access_usage(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_api_keys_developer ON access_api_keys(developer_id);
CREATE INDEX IF NOT EXISTS idx_access_api_keys_hash ON access_api_keys(key_hash);

-- ═══ RLS POLICIES ═══
ALTER TABLE core_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ripple_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ripple_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ripple_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ripple_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access core_jobs" ON core_jobs FOR ALL USING (true);
CREATE POLICY "Service role full access core_state" ON core_state FOR ALL USING (true);
CREATE POLICY "Service role full access core_contexts" ON core_contexts FOR ALL USING (true);
CREATE POLICY "Service role full access core_config" ON core_config FOR ALL USING (true);
CREATE POLICY "Service role full access ripple_jobs" ON ripple_jobs FOR ALL USING (true);
CREATE POLICY "Service role full access ripple_topics" ON ripple_topics FOR ALL USING (true);
CREATE POLICY "Service role full access ripple_subscriptions" ON ripple_subscriptions FOR ALL USING (true);
CREATE POLICY "Service role full access ripple_events" ON ripple_events FOR ALL USING (true);
CREATE POLICY "Service role full access access_api_keys" ON access_api_keys FOR ALL USING (true);
CREATE POLICY "Service role full access access_usage" ON access_usage FOR ALL USING (true);
CREATE POLICY "Service role full access access_quotas" ON access_quotas FOR ALL USING (true);
CREATE POLICY "Service role full access access_subscriptions" ON access_subscriptions FOR ALL USING (true);

-- ═══ INITIAL DATA ═══

-- Insert initial core state
INSERT INTO core_state (id, state, modules_status, boot_sequence)
VALUES (
  '00000000-0000-0000-0001-000000000001',
  'running',
  '{"brain": "healthy", "decode": "healthy", "defense": "healthy", "nexus": "healthy", "vision": "healthy", "dream": "healthy", "system": "healthy", "modernizer": "healthy", "core": "healthy", "ripple": "healthy", "access": "healthy"}',
  '["core", "brain", "decode", "defense", "nexus", "vision", "dream", "ripple", "access", "system", "modernizer"]'
) ON CONFLICT DO NOTHING;

-- Insert core config defaults
INSERT INTO core_config (key, value, category, description) VALUES
  ('rate_limit_default', '{"per_minute": 60, "per_hour": 1000, "per_day": 10000}', 'limits', 'Default rate limits'),
  ('module_timeout_ms', '25000', 'performance', 'Default module timeout'),
  ('auto_heal_threshold', '40', 'resilience', 'Health score threshold for auto-heal'),
  ('max_retries', '3', 'jobs', 'Default max retries for jobs'),
  ('substrate_version', '"2026.10"', 'system', 'Current substrate version')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Insert default pub/sub topics
INSERT INTO ripple_topics (name, description) VALUES
  ('memory.stored', 'Emitted when a new memory is stored in brain'),
  ('memory.recalled', 'Emitted when memories are recalled'),
  ('dream.completed', 'Emitted when a dream cycle completes'),
  ('threat.detected', 'Emitted when defense detects a threat'),
  ('health.degraded', 'Emitted when module health drops below threshold'),
  ('system.boot', 'Emitted when substrate boots'),
  ('system.shutdown', 'Emitted before substrate shutdown')
ON CONFLICT (name) DO NOTHING;

-- Create update trigger for core_state
CREATE OR REPLACE FUNCTION update_core_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_core_state_updated_at ON core_state;
CREATE TRIGGER update_core_state_updated_at
  BEFORE UPDATE ON core_state
  FOR EACH ROW
  EXECUTE FUNCTION update_core_state_timestamp();