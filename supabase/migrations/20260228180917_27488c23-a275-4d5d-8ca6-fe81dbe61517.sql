
-- ═══════════════════════════════════════════════════════════
-- Control Plane: Atomic Versioned Persistence + Leases + WAL
-- ═══════════════════════════════════════════════════════════

-- 1) Revision tracking
CREATE TABLE public.substrate_cp_revisions (
  revision_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_revision_id bigint REFERENCES public.substrate_cp_revisions(revision_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  env text NOT NULL DEFAULT 'prod',
  tenant_id text NOT NULL DEFAULT 'global',
  snapshot_hash text,
  status text NOT NULL DEFAULT 'pending',
  domain_counts jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX idx_cp_revisions_env_tenant ON public.substrate_cp_revisions (env, tenant_id, revision_id DESC);

ALTER TABLE public.substrate_cp_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only revisions" ON public.substrate_cp_revisions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Snapshot manifest
CREATE TABLE public.substrate_cp_snapshot_manifest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id bigint NOT NULL REFERENCES public.substrate_cp_revisions(revision_id),
  env text NOT NULL DEFAULT 'prod',
  tenant_id text NOT NULL DEFAULT 'global',
  domain_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cp_manifest_revision ON public.substrate_cp_snapshot_manifest (revision_id);

ALTER TABLE public.substrate_cp_snapshot_manifest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only manifest" ON public.substrate_cp_snapshot_manifest
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Write-Ahead Log
CREATE TABLE public.substrate_cp_wal (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  revision_id bigint REFERENCES public.substrate_cp_revisions(revision_id),
  domain text NOT NULL,
  action text NOT NULL,
  key text,
  before_value jsonb,
  after_value jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  env text NOT NULL DEFAULT 'prod',
  tenant_id text NOT NULL DEFAULT 'global',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cp_wal_revision ON public.substrate_cp_wal (revision_id);
CREATE INDEX idx_cp_wal_env_tenant ON public.substrate_cp_wal (env, tenant_id, id DESC);

ALTER TABLE public.substrate_cp_wal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only wal" ON public.substrate_cp_wal
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Leader leases
CREATE TABLE public.substrate_leases (
  lease_key text PRIMARY KEY,
  owner_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  env text NOT NULL DEFAULT 'prod',
  tenant_id text NOT NULL DEFAULT 'global',
  acquired_at timestamptz NOT NULL DEFAULT now(),
  renewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.substrate_leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only leases" ON public.substrate_leases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow service_role full access for RPC functions
CREATE POLICY "Service role leases" ON public.substrate_leases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5) Restore jobs
CREATE TABLE public.substrate_cp_restore_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_revision_id bigint NOT NULL REFERENCES public.substrate_cp_revisions(revision_id),
  replay_wal boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  initiated_by uuid,
  env text NOT NULL DEFAULT 'prod',
  tenant_id text NOT NULL DEFAULT 'global',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.substrate_cp_restore_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only restore" ON public.substrate_cp_restore_jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════════════════════════════════
-- 6) Add revision columns to existing persistence tables
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.substrate_flags
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_config
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_canaries
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_retry_buckets
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_metrics_snapshot
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_cascade_history
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_idempotency
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_schema_registry
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_queue_snapshot
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

ALTER TABLE public.substrate_chaos_rules
  ADD COLUMN IF NOT EXISTS revision_id bigint,
  ADD COLUMN IF NOT EXISTS env text DEFAULT 'prod',
  ADD COLUMN IF NOT EXISTS tenant_id text DEFAULT 'global';

-- Composite indexes for revision queries
CREATE INDEX IF NOT EXISTS idx_flags_env_tenant_rev ON public.substrate_flags (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_config_env_tenant_rev ON public.substrate_config (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_canaries_env_tenant_rev ON public.substrate_canaries (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_retry_env_tenant_rev ON public.substrate_retry_buckets (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_metrics_env_tenant_rev ON public.substrate_metrics_snapshot (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_cascade_env_tenant_rev ON public.substrate_cascade_history (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_idempotency_env_tenant_rev ON public.substrate_idempotency (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_schema_env_tenant_rev ON public.substrate_schema_registry (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_queue_env_tenant_rev ON public.substrate_queue_snapshot (env, tenant_id, revision_id DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_chaos_env_tenant_rev ON public.substrate_chaos_rules (env, tenant_id, revision_id DESC NULLS LAST);

-- ═══════════════════════════════════════════════════════════
-- 7) RPC: cp_commit_snapshot
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cp_commit_snapshot(
  p_env text DEFAULT 'prod',
  p_tenant_id text DEFAULT 'global',
  p_created_by uuid DEFAULT NULL,
  p_parent_revision_id bigint DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_wal_events jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_revision_id bigint;
  v_hash text;
  v_counts jsonb := '{}'::jsonb;
  v_domain text;
  v_domain_data jsonb;
  v_row jsonb;
  v_wal_event jsonb;
BEGIN
  -- 1) Create revision
  INSERT INTO substrate_cp_revisions (parent_revision_id, created_by, env, tenant_id, status, metadata)
  VALUES (p_parent_revision_id, p_created_by, p_env, p_tenant_id, 'pending', '{}'::jsonb)
  RETURNING revision_id INTO v_revision_id;

  -- 2) Process each domain in payload
  FOR v_domain, v_domain_data IN SELECT * FROM jsonb_each(p_payload)
  LOOP
    IF jsonb_typeof(v_domain_data) = 'array' THEN
      -- Count items
      v_counts := v_counts || jsonb_build_object(v_domain, jsonb_array_length(v_domain_data));
      
      -- Upsert per domain
      IF v_domain = 'flags' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_flags (key, enabled, rollout_percent, metadata, revision_id, env, tenant_id, updated_at)
          VALUES (
            v_row->>'key', (v_row->>'enabled')::boolean, (v_row->>'rollout_percent')::numeric,
            COALESCE(v_row->'metadata', '{}'::jsonb), v_revision_id, p_env, p_tenant_id, now()
          )
          ON CONFLICT (key) DO UPDATE SET
            enabled = EXCLUDED.enabled, rollout_percent = EXCLUDED.rollout_percent,
            metadata = EXCLUDED.metadata, revision_id = EXCLUDED.revision_id,
            env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, updated_at = now();
        END LOOP;

      ELSIF v_domain = 'config' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_config (key, value, revision_id, env, tenant_id, updated_at)
          VALUES (v_row->>'key', v_row->'value', v_revision_id, p_env, p_tenant_id, now())
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value, revision_id = EXCLUDED.revision_id,
            env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, updated_at = now();
        END LOOP;

      ELSIF v_domain = 'canaries' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_canaries (id, percent, enabled, metrics_json, revision_id, env, tenant_id, updated_at)
          VALUES (
            v_row->>'id', (v_row->>'percent')::numeric, (v_row->>'enabled')::boolean,
            COALESCE(v_row->'metrics_json', '{}'::jsonb), v_revision_id, p_env, p_tenant_id, now()
          )
          ON CONFLICT (id) DO UPDATE SET
            percent = EXCLUDED.percent, enabled = EXCLUDED.enabled,
            metrics_json = EXCLUDED.metrics_json, revision_id = EXCLUDED.revision_id,
            env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, updated_at = now();
        END LOOP;

      ELSIF v_domain = 'retry_budgets' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_retry_buckets (module, tokens, max_tokens, refill_rate, stats_json, revision_id, env, tenant_id, updated_at)
          VALUES (
            v_row->>'module', (v_row->>'tokens')::numeric, (v_row->>'max_tokens')::numeric,
            (v_row->>'refill_rate')::numeric, COALESCE(v_row->'stats_json', '{}'::jsonb),
            v_revision_id, p_env, p_tenant_id, now()
          )
          ON CONFLICT (module) DO UPDATE SET
            tokens = EXCLUDED.tokens, max_tokens = EXCLUDED.max_tokens,
            refill_rate = EXCLUDED.refill_rate, stats_json = EXCLUDED.stats_json,
            revision_id = EXCLUDED.revision_id, env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, updated_at = now();
        END LOOP;

      ELSIF v_domain = 'metrics' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_metrics_snapshot (name, value, labels_json, revision_id, env, tenant_id, updated_at)
          VALUES (
            v_row->>'name', (v_row->>'value')::numeric,
            COALESCE(v_row->'labels_json', '{}'::jsonb), v_revision_id, p_env, p_tenant_id, now()
          )
          ON CONFLICT (name, labels_json) DO UPDATE SET
            value = EXCLUDED.value, revision_id = EXCLUDED.revision_id,
            env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, updated_at = now();
        END LOOP;

      ELSIF v_domain = 'schemas' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_schema_registry (entity, version, fields_json, migrations_json, revision_id, env, tenant_id, registered_at)
          VALUES (
            v_row->>'entity', (v_row->>'version')::integer,
            COALESCE(v_row->'fields_json', '[]'::jsonb), COALESCE(v_row->'migrations_json', '[]'::jsonb),
            v_revision_id, p_env, p_tenant_id, now()
          )
          ON CONFLICT (entity) DO UPDATE SET
            version = EXCLUDED.version, fields_json = EXCLUDED.fields_json,
            migrations_json = EXCLUDED.migrations_json, revision_id = EXCLUDED.revision_id,
            env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, registered_at = now();
        END LOOP;

      ELSIF v_domain = 'chaos' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_chaos_rules (id, type, target, probability, config_json, enabled, revision_id, env, tenant_id, updated_at)
          VALUES (
            v_row->>'id', v_row->>'type', v_row->>'target', (v_row->>'probability')::numeric,
            COALESCE(v_row->'config_json', '{}'::jsonb), (v_row->>'enabled')::boolean,
            v_revision_id, p_env, p_tenant_id, now()
          )
          ON CONFLICT (id) DO UPDATE SET
            type = EXCLUDED.type, target = EXCLUDED.target, probability = EXCLUDED.probability,
            config_json = EXCLUDED.config_json, enabled = EXCLUDED.enabled,
            revision_id = EXCLUDED.revision_id, env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, updated_at = now();
        END LOOP;

      ELSIF v_domain = 'queue' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_queue_snapshot (id, serialized_heap_json, stats_json, revision_id, env, tenant_id, updated_at)
          VALUES (
            COALESCE(v_row->>'id', 'default'), COALESCE(v_row->'serialized_heap_json', '[]'::jsonb),
            COALESCE(v_row->'stats_json', '{}'::jsonb), v_revision_id, p_env, p_tenant_id, now()
          )
          ON CONFLICT (id) DO UPDATE SET
            serialized_heap_json = EXCLUDED.serialized_heap_json, stats_json = EXCLUDED.stats_json,
            revision_id = EXCLUDED.revision_id, env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id, updated_at = now();
        END LOOP;

      ELSIF v_domain = 'idempotency' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_idempotency (key, status, result_json, expires_at, revision_id, env, tenant_id)
          VALUES (
            v_row->>'key', v_row->>'status', v_row->'result_json',
            (v_row->>'expires_at')::timestamptz, v_revision_id, p_env, p_tenant_id
          )
          ON CONFLICT (key) DO UPDATE SET
            status = EXCLUDED.status, result_json = EXCLUDED.result_json,
            expires_at = EXCLUDED.expires_at, revision_id = EXCLUDED.revision_id,
            env = EXCLUDED.env, tenant_id = EXCLUDED.tenant_id;
        END LOOP;

      ELSIF v_domain = 'cascade' THEN
        FOR v_row IN SELECT * FROM jsonb_array_elements(v_domain_data)
        LOOP
          INSERT INTO substrate_cascade_history (origin, chain_json, confidence, revision_id, env, tenant_id, detected_at)
          VALUES (
            v_row->>'origin', COALESCE(v_row->'chain_json', '[]'::jsonb),
            (v_row->>'confidence')::numeric, v_revision_id, p_env, p_tenant_id, now()
          );
        END LOOP;
      END IF;
    END IF;
  END LOOP;

  -- 3) Insert WAL events
  FOR v_wal_event IN SELECT * FROM jsonb_array_elements(p_wal_events)
  LOOP
    INSERT INTO substrate_cp_wal (revision_id, domain, action, key, before_value, after_value, metadata, env, tenant_id)
    VALUES (
      v_revision_id, v_wal_event->>'domain', v_wal_event->>'action',
      v_wal_event->>'key', v_wal_event->'before', v_wal_event->'after',
      COALESCE(v_wal_event->'metadata', '{}'::jsonb), p_env, p_tenant_id
    );
  END LOOP;

  -- 4) Compute hash (simplified: md5 of payload + revision for now)
  v_hash := md5(p_payload::text || v_revision_id::text || COALESCE(p_parent_revision_id::text, 'null'));

  -- 5) Create manifest
  INSERT INTO substrate_cp_snapshot_manifest (revision_id, env, tenant_id, domain_counts, payload_hash)
  VALUES (v_revision_id, p_env, p_tenant_id, v_counts, v_hash);

  -- 6) Finalize revision
  UPDATE substrate_cp_revisions
  SET status = 'committed', snapshot_hash = v_hash, domain_counts = v_counts
  WHERE revision_id = v_revision_id;

  RETURN jsonb_build_object(
    'revision_id', v_revision_id,
    'snapshot_hash', v_hash,
    'counts', v_counts,
    'status', 'committed'
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 8) Lease RPCs
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cp_acquire_lease(
  p_lease_key text,
  p_owner_id text,
  p_ttl_seconds integer DEFAULT 60,
  p_env text DEFAULT 'prod',
  p_tenant_id text DEFAULT 'global'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO substrate_leases (lease_key, owner_id, expires_at, env, tenant_id, acquired_at, renewed_at)
  VALUES (p_lease_key, p_owner_id, now() + (p_ttl_seconds || ' seconds')::interval, p_env, p_tenant_id, now(), now())
  ON CONFLICT (lease_key) DO UPDATE SET
    owner_id = EXCLUDED.owner_id,
    expires_at = EXCLUDED.expires_at,
    env = EXCLUDED.env,
    tenant_id = EXCLUDED.tenant_id,
    acquired_at = now(),
    renewed_at = now()
  WHERE substrate_leases.expires_at < now()
     OR substrate_leases.owner_id = p_owner_id;

  RETURN (SELECT owner_id = p_owner_id FROM substrate_leases WHERE lease_key = p_lease_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.cp_renew_lease(
  p_lease_key text,
  p_owner_id text,
  p_ttl_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE substrate_leases
  SET expires_at = now() + (p_ttl_seconds || ' seconds')::interval,
      renewed_at = now()
  WHERE lease_key = p_lease_key
    AND owner_id = p_owner_id
    AND expires_at >= now();

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.cp_release_lease(
  p_lease_key text,
  p_owner_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM substrate_leases
  WHERE lease_key = p_lease_key AND owner_id = p_owner_id;
  RETURN FOUND;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 9) Backfill: create baseline revision for existing data
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.substrate_cp_revisions (parent_revision_id, env, tenant_id, status, snapshot_hash, metadata)
VALUES (NULL, 'prod', 'global', 'committed', 'baseline', '{"note":"backfill baseline"}'::jsonb);

-- Backfill existing rows with baseline revision
UPDATE public.substrate_flags SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_config SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_canaries SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_retry_buckets SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_metrics_snapshot SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_cascade_history SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_idempotency SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_schema_registry SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_queue_snapshot SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
UPDATE public.substrate_chaos_rules SET revision_id = 1, env = 'prod', tenant_id = 'global' WHERE revision_id IS NULL;
