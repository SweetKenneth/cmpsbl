
-- Drop the broken governor policies that reference a non-existent 'governor' enum value
DROP POLICY IF EXISTS "Governor can manage backup exports" ON public.backup_exports;
DROP POLICY IF EXISTS "Governor can manage import logs" ON public.backup_import_log;
DROP POLICY IF EXISTS "Governor can read backups" ON public.daily_backups;
DROP POLICY IF EXISTS "Governor can delete backups" ON public.daily_backups;
