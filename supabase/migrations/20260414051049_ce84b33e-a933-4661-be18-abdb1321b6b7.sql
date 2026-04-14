-- Pass 3: Fix lex_registry registrant_email exposure to all authenticated users

-- Drop the overly broad authenticated read policy
DROP POLICY IF EXISTS "Authenticated read registry" ON public.lex_registry;

-- Create scoped policy: users can only read their OWN registrations
CREATE POLICY "Users can read own registrations"
ON public.lex_registry
FOR SELECT
TO authenticated
USING (registrant_user_id = auth.uid());

-- Create admin policy: governors can read all
CREATE POLICY "Admins can read all registrations"
ON public.lex_registry
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Defense-in-depth: revoke column-level SELECT on registrant_email
REVOKE SELECT (registrant_email) ON public.lex_registry FROM anon;
REVOKE SELECT (registrant_email) ON public.lex_registry FROM authenticated;