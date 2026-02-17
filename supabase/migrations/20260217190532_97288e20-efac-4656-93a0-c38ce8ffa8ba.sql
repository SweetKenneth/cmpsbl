
-- Fix: Remove public read policies on security-critical tables
-- Replace with admin-only access

-- 1. audit_logs: Drop the permissive "Authenticated read" policy (admin policy already exists)
DROP POLICY IF EXISTS "Authenticated read audit_logs" ON public.audit_logs;

-- 2. system_config: Drop public read, add admin-only read
DROP POLICY IF EXISTS "Allow public read on system_config" ON public.system_config;
CREATE POLICY "Admin can read system_config" ON public.system_config
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 3. ip_reputation: Drop public read, add admin-only read
DROP POLICY IF EXISTS "Allow public read on ip_reputation" ON public.ip_reputation;
CREATE POLICY "Admin can read ip_reputation" ON public.ip_reputation
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 4. defense_events: Drop the public read policy (admin policy already exists)
DROP POLICY IF EXISTS "Anyone can view defense events" ON public.defense_events;
