
-- Fix 1: restoration_sessions - restrict SELECT to fingerprint/serial match only
DROP POLICY IF EXISTS "Anyone can read by fingerprint" ON public.restoration_sessions;

CREATE POLICY "Read own sessions by fingerprint"
  ON public.restoration_sessions
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- Since the app queries by fingerprint and serial_number via client,
-- we need a security definer function instead
CREATE OR REPLACE FUNCTION public.lookup_restoration_by_fingerprint(p_fingerprint text)
RETURNS SETOF public.restoration_sessions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.restoration_sessions
  WHERE fingerprint = p_fingerprint
  ORDER BY created_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.lookup_restoration_by_serial(p_serial text)
RETURNS SETOF public.restoration_sessions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.restoration_sessions
  WHERE serial_number = p_serial
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Fix 2: vertical_ascension_sessions - restrict anon SELECT to fingerprint match
DROP POLICY IF EXISTS "Anon can view ascension by fingerprint" ON public.vertical_ascension_sessions;

CREATE POLICY "Anon can view own ascension by fingerprint"
  ON public.vertical_ascension_sessions
  FOR SELECT
  TO anon
  USING (false);

CREATE OR REPLACE FUNCTION public.lookup_vertical_ascension_by_fingerprint(p_fingerprint text)
RETURNS SETOF public.vertical_ascension_sessions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.vertical_ascension_sessions
  WHERE fingerprint_id = p_fingerprint
  ORDER BY created_at DESC;
$$;

-- Fix 3: Radio storage - restrict write/delete to service_role only
DROP POLICY IF EXISTS "Service role can delete radio files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update radio files" ON storage.objects;

CREATE POLICY "Service role can update radio files"
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'radio');

CREATE POLICY "Service role can delete radio files"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'radio');
