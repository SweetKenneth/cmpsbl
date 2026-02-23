
-- Fix missing UPDATE policy for integrity_scan_runs (scan completion updates status)
CREATE POLICY "Admin update integrity_scan_runs"
ON public.integrity_scan_runs
FOR UPDATE
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));

-- Fix missing UPDATE policy for system_snapshots  
CREATE POLICY "Admin update system_snapshots"
ON public.system_snapshots
FOR UPDATE
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));

-- Fix missing DELETE policy for system_snapshots (cleanup)
CREATE POLICY "Admin delete system_snapshots"
ON public.system_snapshots
FOR DELETE
USING (has_role('admin'::text));

-- Fix missing UPDATE policy for integrity_findings
CREATE POLICY "Admin update integrity_findings"
ON public.integrity_findings
FOR UPDATE
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));
