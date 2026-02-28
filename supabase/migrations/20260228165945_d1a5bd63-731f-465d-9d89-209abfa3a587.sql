
-- Lead captures table for email collection
CREATE TABLE public.lead_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'general',
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT lead_captures_email_unique UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

-- Public insert policy (anyone can submit their email)
CREATE POLICY "Anyone can submit lead capture" 
ON public.lead_captures 
FOR INSERT 
WITH CHECK (true);

-- Only admins can read leads
CREATE POLICY "Admins can read lead captures" 
ON public.lead_captures 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));
