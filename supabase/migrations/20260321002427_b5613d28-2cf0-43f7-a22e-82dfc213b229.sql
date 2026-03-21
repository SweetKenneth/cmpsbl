
-- System boot log for tracking uptime
CREATE TABLE public.system_boot_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boot_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.system_boot_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "Admins can manage boot log"
  ON public.system_boot_log
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
