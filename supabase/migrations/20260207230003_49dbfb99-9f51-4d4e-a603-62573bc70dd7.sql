-- Add INSERT policy for agency_purchases that allows admins to insert
CREATE POLICY "Admins can insert purchases"
ON public.agency_purchases
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::text)
  OR user_id = auth.uid()
);

-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role inserts purchases" ON public.agency_purchases;