-- Fix: Restrict public viewing of deployed agencies to authenticated users only
-- This prevents competitors from scraping business-sensitive agency configurations

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view deployed agencies by slug" ON public.agencies;

-- Create a new policy that requires authentication for viewing deployed agencies
CREATE POLICY "Authenticated can view deployed agencies by slug" 
ON public.agencies 
FOR SELECT 
TO authenticated
USING (
  (status = 'deployed' AND slug IS NOT NULL)
  OR owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::text)
);