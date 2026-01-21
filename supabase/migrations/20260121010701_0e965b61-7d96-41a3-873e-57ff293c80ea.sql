-- Add slug column to agencies for URL routing
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies(slug);

-- Add RLS policy for public agency access by slug (deployed agencies only)
CREATE POLICY "Public can view deployed agencies by slug" 
ON public.agencies 
FOR SELECT 
USING (status = 'deployed' AND slug IS NOT NULL);