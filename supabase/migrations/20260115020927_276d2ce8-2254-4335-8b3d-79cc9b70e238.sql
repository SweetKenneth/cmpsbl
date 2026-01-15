-- Create an unambiguous RPC wrapper for role checks (avoids overloaded has_role resolution issues)
CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = (_role::public.app_role)
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role_text(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role_text(uuid, text) TO authenticated;