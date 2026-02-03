-- Create atlas_capabilities table for SEBA and other capability toggles
CREATE TABLE IF NOT EXISTS public.atlas_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.atlas_capabilities ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read capabilities (needed for scheduler)
CREATE POLICY "Anyone can read capabilities" 
ON public.atlas_capabilities 
FOR SELECT 
USING (true);

-- Only admins can modify capabilities
CREATE POLICY "Admins can manage capabilities" 
ON public.atlas_capabilities 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create update trigger
CREATE TRIGGER update_atlas_capabilities_timestamp
BEFORE UPDATE ON public.atlas_capabilities
FOR EACH ROW
EXECUTE FUNCTION public.update_substrate_timestamp();

-- Insert default SEBA capability
INSERT INTO public.atlas_capabilities (key, enabled, description)
VALUES ('seba.enabled', true, 'Self-Evolving Bounded Agent - 24/7 autonomous improvement cycles')
ON CONFLICT (key) DO UPDATE SET enabled = true, updated_at = now();