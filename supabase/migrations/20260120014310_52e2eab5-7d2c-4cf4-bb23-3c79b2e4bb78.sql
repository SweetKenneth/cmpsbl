-- Create bots_versions table for semantic versioning
CREATE TABLE public.bots_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  version TEXT NOT NULL DEFAULT '1.0.0',
  semver_major INTEGER NOT NULL DEFAULT 1,
  semver_minor INTEGER NOT NULL DEFAULT 0,
  semver_patch INTEGER NOT NULL DEFAULT 0,
  changelog TEXT,
  release_notes TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id, version)
);

-- Add version column to bots table for quick reference
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS current_version TEXT DEFAULT '1.0.0';
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS version_count INTEGER DEFAULT 1;

-- Create index for faster lookups
CREATE INDEX idx_bots_versions_bot_id ON public.bots_versions(bot_id);
CREATE INDEX idx_bots_versions_latest ON public.bots_versions(bot_id, is_latest) WHERE is_latest = true;

-- Enable RLS on bots_versions
ALTER TABLE public.bots_versions ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone authenticated can read versions
CREATE POLICY "Authenticated users can read bot versions"
  ON public.bots_versions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS: Bot owners can insert/update versions
CREATE POLICY "Bot owners can create versions"
  ON public.bots_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bots
      WHERE bots.id = bot_id AND bots.user_id = auth.uid()
    )
  );

CREATE POLICY "Bot owners can update versions"
  ON public.bots_versions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bots
      WHERE bots.id = bot_id AND bots.user_id = auth.uid()
    )
  );

-- Admins can manage all versions
CREATE POLICY "Admins can manage all versions"
  ON public.bots_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_bots_versions_updated_at
  BEFORE UPDATE ON public.bots_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing bots to have initial version record
INSERT INTO public.bots_versions (bot_id, version, semver_major, semver_minor, semver_patch, changelog, is_latest)
SELECT id, '1.0.0', 1, 0, 0, 'Initial release', true
FROM public.bots
WHERE NOT EXISTS (
  SELECT 1 FROM public.bots_versions WHERE bots_versions.bot_id = bots.id
);