-- Allow admin/governor to read all mailing list entries
CREATE POLICY "Admins can view all mailing list entries"
ON public.marketplace_mailing_list
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));