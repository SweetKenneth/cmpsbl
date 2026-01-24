-- Marketplace Licenses Table
CREATE TABLE public.marketplace_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_hash TEXT NOT NULL UNIQUE,
  license_key_prefix TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('os', 'template')),
  product_id TEXT,
  template_name TEXT,
  purchaser_email TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  amount_paid INTEGER,
  activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  activated_domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_licenses ENABLE ROW LEVEL SECURITY;

-- Users can view their own licenses
CREATE POLICY "Users can view own licenses" 
ON public.marketplace_licenses 
FOR SELECT 
USING (purchaser_email = auth.jwt() ->> 'email');

-- Service role can manage all licenses (for edge functions)
CREATE POLICY "Service role can manage licenses" 
ON public.marketplace_licenses 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Public can insert (for checkout flow before auth)
CREATE POLICY "Allow license creation" 
ON public.marketplace_licenses 
FOR INSERT 
WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_licenses_email ON public.marketplace_licenses(purchaser_email);
CREATE INDEX idx_licenses_session ON public.marketplace_licenses(stripe_session_id);
CREATE INDEX idx_licenses_hash ON public.marketplace_licenses(license_key_hash);

-- Trigger for updated_at
CREATE TRIGGER update_marketplace_licenses_updated_at
BEFORE UPDATE ON public.marketplace_licenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();