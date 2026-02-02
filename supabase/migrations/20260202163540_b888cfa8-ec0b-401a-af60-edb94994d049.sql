-- Fix proposal & stamp persistence for Atlas/SEBA using existing app_role enum values.
-- app_role enum values: admin | moderator | user

-- =========================================
-- evolution_proposals: allow moderator/admin
-- =========================================

CREATE POLICY "Moderators can read evolution_proposals"
ON public.evolution_proposals
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'moderator'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Moderators can insert evolution_proposals"
ON public.evolution_proposals
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'moderator'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Moderators can update evolution_proposals"
ON public.evolution_proposals
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'moderator'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'moderator'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================
-- brain_events: allow moderator/admin for key modules
-- =========================================

CREATE POLICY "Moderators can read internal brain_events"
ON public.brain_events
FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND module IN ('seba', 'modernizer', 'atlas')
);

CREATE POLICY "Moderators can insert internal brain_events"
ON public.brain_events
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND module IN ('seba', 'modernizer', 'atlas')
);
