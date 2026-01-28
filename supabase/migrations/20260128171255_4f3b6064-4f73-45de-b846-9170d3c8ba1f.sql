-- Add failsafe_backup_id column to substrate_upgrade_plans for atomic rollback tracking
ALTER TABLE public.substrate_upgrade_plans 
ADD COLUMN IF NOT EXISTS failsafe_backup_id TEXT;