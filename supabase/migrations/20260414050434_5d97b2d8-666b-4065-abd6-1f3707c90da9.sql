
DROP VIEW IF EXISTS public.lex_registry_public;

CREATE VIEW public.lex_registry_public
WITH (security_invoker = true) AS
SELECT id, package_name, package_hash, status, registrant_org, registered_at, updated_at, metadata
FROM public.lex_registry;

GRANT SELECT ON public.lex_registry_public TO anon;
GRANT SELECT ON public.lex_registry_public TO authenticated;
