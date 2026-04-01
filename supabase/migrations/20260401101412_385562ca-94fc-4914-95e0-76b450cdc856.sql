
-- ================================================
-- FULL HARDENING MIGRATION
-- ================================================

-- 1. LOGIN RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email text,
  attempt_type text NOT NULL DEFAULT 'login',
  failed_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role manages rate limits"
  ON public.auth_rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time
  ON public.auth_rate_limits (ip_address, failed_at DESC);

-- 2. AUTH EVENT LOG TABLE
CREATE TABLE IF NOT EXISTS public.auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  geo_country text,
  geo_city text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role manages auth events"
  ON public.auth_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can read auth events"
  ON public.auth_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_auth_events_user
  ON public.auth_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_events_type
  ON public.auth_events (event_type, created_at DESC);

-- 3. CANARY TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.canary_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_name text NOT NULL,
  table_name text NOT NULL,
  trigger_count int DEFAULT 0,
  last_triggered_at timestamptz,
  last_triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.canary_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role manages canary tokens"
  ON public.canary_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert canary rows
INSERT INTO public.canary_tokens (token_name, table_name)
VALUES
  ('honeypot_brain_memories', 'brain_memories'),
  ('honeypot_governance', 'governance_mode'),
  ('honeypot_audit', 'audit_logs'),
  ('honeypot_user_roles', 'user_roles'),
  ('honeypot_backups', 'backups');

-- 4. GEOGRAPHIC LOGIN TRACKING
CREATE TABLE IF NOT EXISTS public.auth_geo_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address text,
  country_code text,
  city text,
  latitude double precision,
  longitude double precision,
  distance_from_last_km double precision,
  is_anomalous boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_geo_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role manages geo log"
  ON public.auth_geo_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can read geo log"
  ON public.auth_geo_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_geo_log_user
  ON public.auth_geo_log (user_id, created_at DESC);

-- 5. ADMIN IP ALLOWLIST
CREATE TABLE IF NOT EXISTS public.admin_ip_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  label text,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_ip_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins manage IP allowlist"
  ON public.admin_ip_allowlist FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 6. DISPOSABLE EMAIL DOMAIN BLOCKER (database function)
CREATE OR REPLACE FUNCTION public.is_disposable_email(email_addr text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  domain text;
  disposable_domains text[] := ARRAY[
    'maildrop.cc', 'guerrillamail.com', 'guerrillamail.de', 'grr.la',
    'guerrillamail.net', 'tempmail.com', 'throwaway.email', 'temp-mail.org',
    'tempail.com', 'fakeinbox.com', 'sharklasers.com', 'guerrillamailblock.com',
    'pokemail.net', 'spam4.me', 'dispostable.com', 'yopmail.com',
    'mailinator.com', 'trashmail.com', 'trashmail.me', 'trashmail.net',
    'leakscope-test.dev', 'tempinbox.com', 'discard.email', 'mailnesia.com',
    'harakirimail.com', 'meltmail.com', 'nospamfor.us', 'mailcatch.com',
    'mintemail.com', 'tempr.email', 'burnermail.io', 'jetable.org',
    'getairmail.com', 'filzmail.com', 'mailexpire.com', 'tempail.com',
    'mytemp.email', 'mohmal.com', 'emailondeck.com', 'getnada.com',
    'mailtrap.io', 'mailsac.com', '10minutemail.com', 'guerrillamail.info',
    'crazymailing.com', 'deadaddress.com', 'sogetthis.com', 'mailnator.com',
    'tmail.ws', 'bugmenot.com'
  ];
BEGIN
  domain := lower(split_part(email_addr, '@', 2));
  RETURN domain = ANY(disposable_domains);
END;
$$;

-- 7. CANARY TRIGGER FUNCTION — logs when sensitive queries happen
CREATE OR REPLACE FUNCTION public.canary_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log canary access to audit
  INSERT INTO public.audit_logs (action, performed_by, entity_type, entity_id, details)
  VALUES (
    'CANARY_TRIGGERED',
    COALESCE(auth.uid()::text, 'anonymous'),
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text, 'unknown'),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now(),
      'severity', 'critical'
    )
  );

  -- Update canary token
  UPDATE public.canary_tokens
  SET trigger_count = trigger_count + 1,
      last_triggered_at = now(),
      last_triggered_by = auth.uid()
  WHERE table_name = TG_TABLE_NAME;

  RETURN COALESCE(NEW, OLD);
END;
$$;
