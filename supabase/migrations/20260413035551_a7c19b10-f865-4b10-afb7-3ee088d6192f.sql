
-- Lex Registry — The Universal Blacklist/Whitelist
-- U.S. Patent App. No. 64/031,637

-- Status enum for registry entries
CREATE TYPE public.lex_registry_status AS ENUM ('protected', 'licensed', 'unregistered');

-- Main registry table
CREATE TABLE public.lex_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name TEXT NOT NULL,
  package_hash TEXT NOT NULL UNIQUE,
  status public.lex_registry_status NOT NULL DEFAULT 'protected',
  registrant_email TEXT NOT NULL,
  registrant_org TEXT,
  registrant_user_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_lex_registry_hash ON public.lex_registry (package_hash);
CREATE INDEX idx_lex_registry_status ON public.lex_registry (status);
CREATE INDEX idx_lex_registry_user ON public.lex_registry (registrant_user_id);

-- Enable RLS
ALTER TABLE public.lex_registry ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can look up registry status)
CREATE POLICY "Anyone can read registry entries"
  ON public.lex_registry FOR SELECT
  USING (true);

-- Authenticated users can register packages
CREATE POLICY "Authenticated users can register packages"
  ON public.lex_registry FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = registrant_user_id);

-- Only the registrant can update their own entries
CREATE POLICY "Registrants can update their own entries"
  ON public.lex_registry FOR UPDATE
  TO authenticated
  USING (auth.uid() = registrant_user_id);

-- Immutable audit trail
CREATE TABLE public.lex_registry_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registry_id UUID NOT NULL REFERENCES public.lex_registry(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  previous_status public.lex_registry_status,
  new_status public.lex_registry_status,
  actor_id UUID,
  hash_anchor TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lex_events_registry ON public.lex_registry_events (registry_id);
CREATE INDEX idx_lex_events_type ON public.lex_registry_events (event_type);

-- Enable RLS
ALTER TABLE public.lex_registry_events ENABLE ROW LEVEL SECURITY;

-- Public read for audit transparency
CREATE POLICY "Anyone can read audit events"
  ON public.lex_registry_events FOR SELECT
  USING (true);

-- Only service role can insert events (via edge functions)
CREATE POLICY "Service role inserts audit events"
  ON public.lex_registry_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Updated_at trigger for lex_registry
CREATE OR REPLACE FUNCTION public.update_lex_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_lex_registry_timestamp
  BEFORE UPDATE ON public.lex_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lex_registry_updated_at();

-- Auto-create audit event on registration
CREATE OR REPLACE FUNCTION public.lex_registry_audit_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.lex_registry_events (
    registry_id, event_type, new_status, actor_id, hash_anchor, metadata
  ) VALUES (
    NEW.id,
    'registered',
    NEW.status,
    NEW.registrant_user_id,
    encode(sha256(convert_to(NEW.package_hash || NEW.package_name || NEW.status::text || now()::text, 'UTF8')), 'hex'),
    jsonb_build_object('package_name', NEW.package_name, 'registrant_org', NEW.registrant_org)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER lex_registry_audit_insert
  AFTER INSERT ON public.lex_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.lex_registry_audit_on_insert();

-- Auto-create audit event on status change
CREATE OR REPLACE FUNCTION public.lex_registry_audit_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lex_registry_events (
      registry_id, event_type, previous_status, new_status, actor_id, hash_anchor, metadata
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      NEW.registrant_user_id,
      encode(sha256(convert_to(NEW.package_hash || OLD.status::text || NEW.status::text || now()::text, 'UTF8')), 'hex'),
      jsonb_build_object('previous_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER lex_registry_audit_update
  AFTER UPDATE ON public.lex_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.lex_registry_audit_on_update();
