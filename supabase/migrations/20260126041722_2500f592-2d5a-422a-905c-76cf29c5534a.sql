-- Add missing columns to daily_backups for failsafe and retention management
ALTER TABLE public.daily_backups 
ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS backup_category TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS size_bytes BIGINT DEFAULT 0;

-- Add index for querying permanent backups
CREATE INDEX IF NOT EXISTS idx_daily_backups_permanent ON public.daily_backups(is_permanent) WHERE is_permanent = true;

-- Add index for backup category queries
CREATE INDEX IF NOT EXISTS idx_daily_backups_category ON public.daily_backups(backup_category);