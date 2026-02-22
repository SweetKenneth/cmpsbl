
-- System Snapshots
CREATE TABLE public.system_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('shadow_baseline', 'production_baseline', 'pre_promote', 'post_promote', 'rollback_state')),
  commit_hash TEXT,
  executor_hash TEXT,
  rule_hash TEXT,
  file_manifest_hash TEXT,
  metrics_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read system_snapshots" ON public.system_snapshots FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert system_snapshots" ON public.system_snapshots FOR INSERT WITH CHECK (public.has_role('admin'));

-- System Diffs
CREATE TABLE public.system_diffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shadow_run_id TEXT,
  from_snapshot_id UUID REFERENCES public.system_snapshots(id),
  to_snapshot_id UUID REFERENCES public.system_snapshots(id),
  diff_summary_json JSONB DEFAULT '{}'::jsonb,
  diff_patch_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_diffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read system_diffs" ON public.system_diffs FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert system_diffs" ON public.system_diffs FOR INSERT WITH CHECK (public.has_role('admin'));

-- Production Promotions
CREATE TABLE public.production_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shadow_run_id TEXT,
  pre_snapshot_id UUID REFERENCES public.system_snapshots(id),
  post_snapshot_id UUID REFERENCES public.system_snapshots(id),
  integrity_scan_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'canary', 'success', 'failed', 'rolled_back')),
  verification_passed BOOLEAN DEFAULT false,
  rollback_triggered BOOLEAN DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.production_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read production_promotions" ON public.production_promotions FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert production_promotions" ON public.production_promotions FOR INSERT WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admin update production_promotions" ON public.production_promotions FOR UPDATE USING (public.has_role('admin'));

-- Mutation Receipts
CREATE TABLE public.mutation_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID REFERENCES public.production_promotions(id),
  stage TEXT NOT NULL CHECK (stage IN ('preflight', 'integrity', 'canary', 'verify', 'rollback')),
  outcome TEXT NOT NULL,
  details_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mutation_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read mutation_receipts" ON public.mutation_receipts FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert mutation_receipts" ON public.mutation_receipts FOR INSERT WITH CHECK (public.has_role('admin'));

-- Code Stamps
CREATE TABLE public.code_stamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  promotion_id UUID REFERENCES public.production_promotions(id),
  shadow_run_id TEXT,
  commit_hash TEXT,
  stamp_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.code_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read code_stamps" ON public.code_stamps FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert code_stamps" ON public.code_stamps FOR INSERT WITH CHECK (public.has_role('admin'));

-- Integrity Scan Runs
CREATE TABLE public.integrity_scan_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'quick' CHECK (mode IN ('quick', 'deep', 'pre_promote', 'scheduled')),
  errors_found INTEGER NOT NULL DEFAULT 0,
  warnings_found INTEGER NOT NULL DEFAULT 0,
  health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integrity_scan_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read integrity_scan_runs" ON public.integrity_scan_runs FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert integrity_scan_runs" ON public.integrity_scan_runs FOR INSERT WITH CHECK (public.has_role('admin'));

-- Integrity Findings
CREATE TABLE public.integrity_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.integrity_scan_runs(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'error', 'warning', 'info')),
  file_path TEXT,
  message TEXT NOT NULL,
  suggested_fix TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integrity_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read integrity_findings" ON public.integrity_findings FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert integrity_findings" ON public.integrity_findings FOR INSERT WITH CHECK (public.has_role('admin'));
CREATE INDEX idx_integrity_findings_scan ON public.integrity_findings(scan_id);

-- System Metrics History
CREATE TABLE public.system_metrics_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success_rate NUMERIC,
  escalation_rate NUMERIC,
  encode_assist_rate NUMERIC,
  avg_executor_health NUMERIC,
  rule_count INTEGER DEFAULT 0,
  promoted_rule_count INTEGER DEFAULT 0,
  retired_rule_count INTEGER DEFAULT 0,
  rollback_count INTEGER DEFAULT 0,
  latency_p95 NUMERIC,
  cost_index NUMERIC,
  integrity_health_score INTEGER
);
ALTER TABLE public.system_metrics_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read system_metrics_history" ON public.system_metrics_history FOR SELECT USING (public.has_role('admin'));
CREATE POLICY "Admin insert system_metrics_history" ON public.system_metrics_history FOR INSERT WITH CHECK (public.has_role('admin'));
CREATE INDEX idx_system_metrics_recorded ON public.system_metrics_history(recorded_at DESC);

-- Indexes
CREATE INDEX idx_system_snapshots_type ON public.system_snapshots(type);
CREATE INDEX idx_production_promotions_status ON public.production_promotions(status);
CREATE INDEX idx_mutation_receipts_promotion ON public.mutation_receipts(promotion_id);
CREATE INDEX idx_code_stamps_promotion ON public.code_stamps(promotion_id);
