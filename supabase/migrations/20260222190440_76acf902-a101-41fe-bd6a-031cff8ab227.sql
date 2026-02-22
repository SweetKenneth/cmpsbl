
-- IMMUNITY MESH GOVERNED RULE ENGINE — Schema (fixed)

-- 1) immunity_rules
CREATE TABLE public.immunity_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'unknown',
  source_executor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'learned'
    CHECK (status IN ('learned','candidate','promoted','deprecated','retired','blocked')),
  confidence REAL NOT NULL DEFAULT 0.5,
  success_rate REAL NOT NULL DEFAULT 0.0,
  invocations_24h INT NOT NULL DEFAULT 0,
  invocations_7d INT NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ
);
CREATE INDEX idx_immunity_rules_status ON public.immunity_rules (status);
CREATE INDEX idx_immunity_rules_category ON public.immunity_rules (category);

-- 2) immunity_rule_invocations
CREATE TABLE public.immunity_rule_invocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.immunity_rules(id) ON DELETE CASCADE,
  executor TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'success'
    CHECK (outcome IN ('success','fail','skipped')),
  duration_ms INT NOT NULL DEFAULT 0,
  cost_units REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rule_invocations_rule_created ON public.immunity_rule_invocations (rule_id, created_at);
CREATE INDEX idx_rule_invocations_executor_created ON public.immunity_rule_invocations (executor, created_at);

-- 3) immunity_rule_propagation
CREATE TABLE public.immunity_rule_propagation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.immunity_rules(id) ON DELETE CASCADE,
  from_executor TEXT NOT NULL,
  to_executor TEXT NOT NULL,
  adopted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  adoption_confidence REAL NOT NULL DEFAULT 0.5
);
CREATE INDEX idx_rule_propagation_rule ON public.immunity_rule_propagation (rule_id);
CREATE INDEX idx_rule_propagation_to ON public.immunity_rule_propagation (to_executor);

-- 4) immunity_rule_lineage
CREATE TABLE public.immunity_rule_lineage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_rule_id UUID NOT NULL REFERENCES public.immunity_rules(id) ON DELETE CASCADE,
  child_rule_id UUID NOT NULL REFERENCES public.immunity_rules(id) ON DELETE CASCADE,
  relation TEXT NOT NULL DEFAULT 'refinement'
    CHECK (relation IN ('refinement','generalization','fork','merge')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) immunity_rule_conflicts
CREATE TABLE public.immunity_rule_conflicts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_a_id UUID NOT NULL REFERENCES public.immunity_rules(id) ON DELETE CASCADE,
  rule_b_id UUID NOT NULL REFERENCES public.immunity_rules(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL DEFAULT 'contradictory_output'
    CHECK (conflict_type IN ('contradictory_output','oscillation','double_fix','regression')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolution TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (resolution IN ('prefer_a','prefer_b','conditional','both_blocked','unresolved')),
  notes TEXT
);

-- 6) immunity_mesh_runs
CREATE TABLE public.immunity_mesh_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'synthetic'
    CHECK (mode IN ('replay','synthetic','encode_practice','dual','storm')),
  run_window TEXT NOT NULL DEFAULT '6h',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  total_events INT NOT NULL DEFAULT 0,
  safe_fails INT NOT NULL DEFAULT 0,
  repaired INT NOT NULL DEFAULT 0,
  repair_failures INT NOT NULL DEFAULT 0,
  escalations INT NOT NULL DEFAULT 0,
  notes TEXT
);
CREATE INDEX idx_mesh_runs_mode ON public.immunity_mesh_runs (mode, started_at);

-- RLS
ALTER TABLE public.immunity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunity_rule_invocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunity_rule_propagation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunity_rule_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunity_rule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunity_mesh_runs ENABLE ROW LEVEL SECURITY;

-- Read (authenticated + anon for public stats)
CREATE POLICY "Auth read immunity_rules" ON public.immunity_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read rule_invocations" ON public.immunity_rule_invocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read rule_propagation" ON public.immunity_rule_propagation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read rule_lineage" ON public.immunity_rule_lineage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read rule_conflicts" ON public.immunity_rule_conflicts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read mesh_runs" ON public.immunity_mesh_runs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon read immunity_rules" ON public.immunity_rules FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read mesh_runs" ON public.immunity_mesh_runs FOR SELECT TO anon USING (true);

-- Write (admin)
CREATE POLICY "Admin write immunity_rules" ON public.immunity_rules FOR ALL TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admin write rule_invocations" ON public.immunity_rule_invocations FOR ALL TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admin write rule_propagation" ON public.immunity_rule_propagation FOR ALL TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admin write rule_lineage" ON public.immunity_rule_lineage FOR ALL TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admin write rule_conflicts" ON public.immunity_rule_conflicts FOR ALL TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admin write mesh_runs" ON public.immunity_mesh_runs FOR ALL TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

-- Service role
CREATE POLICY "Service write immunity_rules" ON public.immunity_rules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write rule_invocations" ON public.immunity_rule_invocations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write rule_propagation" ON public.immunity_rule_propagation FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write rule_lineage" ON public.immunity_rule_lineage FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write rule_conflicts" ON public.immunity_rule_conflicts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write mesh_runs" ON public.immunity_mesh_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
