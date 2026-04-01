
-- ================================================
-- CRITICAL SECURITY HARDENING MIGRATION
-- ================================================

-- 1. FIX CAPTCHA: Remove public read (exposes answers)
DROP POLICY IF EXISTS "Anon can read captcha_challenges" ON public.captcha_challenges;
DROP POLICY IF EXISTS "Anon can insert captcha_challenges" ON public.captcha_challenges;

-- Replace with server-side only access
CREATE POLICY "Only service role reads captcha"
  ON public.captcha_challenges FOR SELECT
  USING (false);

CREATE POLICY "Only service role inserts captcha"
  ON public.captcha_challenges FOR INSERT
  WITH CHECK (false);

-- 2. FIX STORAGE: Remove overly permissive backup read policy
DROP POLICY IF EXISTS "Users can read backup exports" ON storage.objects;

-- 3. FIX STORAGE: Lock brain-training-data to admin only
DROP POLICY IF EXISTS "Admins can read training data" ON storage.objects;
CREATE POLICY "Admins can read training data"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'brain-training-data'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 4. FIX STORAGE: Lock training data uploads to admin only
DROP POLICY IF EXISTS "Authenticated users can upload training data" ON storage.objects;
CREATE POLICY "Admins can upload training data"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brain-training-data'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 5. FIX STORAGE: Tighten backup write policies
DROP POLICY IF EXISTS "Service role can write backups" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update backups" ON storage.objects;

-- Re-create backup write as service_role only
CREATE POLICY "Service role can write backups"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'backups')
  WITH CHECK (bucket_id = 'backups');

-- 6. ADD: Audit trigger on user_roles for privilege escalation detection
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (action, performed_by, entity_type, entity_id, details)
  VALUES (
    TG_OP || '_user_role',
    COALESCE(auth.uid()::text, 'system'),
    'user_roles',
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'role', COALESCE(NEW.role::text, OLD.role::text),
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_role_changes ON public.user_roles;
CREATE TRIGGER trg_audit_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();
