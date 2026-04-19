
-- Fix 1: substrate_licenses — remove email-based access path, keep user_id only
DROP POLICY IF EXISTS "Users can view their own licenses" ON public.substrate_licenses;

-- Fix 2: ethical_approvals — restrict public-read to admins only
DROP POLICY IF EXISTS "Public read ethical_approvals" ON public.ethical_approvals;

CREATE POLICY "Admins can read ethical_approvals"
ON public.ethical_approvals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: backups bucket — add DELETE policy for service_role and admins
CREATE POLICY "Service role can delete backups"
ON storage.objects
FOR DELETE
USING (bucket_id = 'backups' AND auth.role() = 'service_role');

CREATE POLICY "Admins can delete backups"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'backups' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 4: realtime.messages — require authentication for channel subscriptions/broadcasts
-- This prevents anonymous users from subscribing to any realtime channel.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can receive broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can send broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can send broadcasts"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);
