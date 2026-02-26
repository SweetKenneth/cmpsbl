
-- User Pack Activations — tracks which artifact packs each user has activated
CREATE TABLE public.user_pack_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_id TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pack_id)
);

-- Activation Audit Log — records all slot events
CREATE TABLE public.activation_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'activated', 'deactivated', 'slot_limit_reached', 'upgrade_triggered'
  slot_capacity INTEGER NOT NULL,
  active_count INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_pack_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS: users can only manage their own activations
CREATE POLICY "Users can view own activations" ON public.user_pack_activations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activations" ON public.user_pack_activations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activations" ON public.user_pack_activations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activations" ON public.user_pack_activations FOR DELETE USING (auth.uid() = user_id);

-- RLS: users can only view/insert their own audit log
CREATE POLICY "Users can view own audit log" ON public.activation_audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit log" ON public.activation_audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_user_pack_activations_timestamp
  BEFORE UPDATE ON public.user_pack_activations
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

-- Index for fast lookup
CREATE INDEX idx_user_pack_activations_user ON public.user_pack_activations(user_id) WHERE active = true;
CREATE INDEX idx_activation_audit_user ON public.activation_audit_log(user_id, created_at DESC);
