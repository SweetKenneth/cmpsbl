
-- Device fingerprint snapshots for drift comparison (hashed signals only)
CREATE TABLE public.device_fingerprint_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint_hash TEXT NOT NULL,
  signal_hashes JSONB NOT NULL DEFAULT '{}'::jsonb,
  signal_buckets JSONB NOT NULL DEFAULT '{}'::jsonb,
  flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  drift_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_dfp_snapshots_hash ON public.device_fingerprint_snapshots (fingerprint_hash);
CREATE INDEX idx_dfp_snapshots_updated ON public.device_fingerprint_snapshots (updated_at);

-- Enable RLS — service-role only (no public policies)
ALTER TABLE public.device_fingerprint_snapshots ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_dfp_snapshots_timestamp
  BEFORE UPDATE ON public.device_fingerprint_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brain_timestamp();
