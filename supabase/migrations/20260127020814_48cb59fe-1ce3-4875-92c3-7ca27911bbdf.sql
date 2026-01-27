-- Create licensing inquiries table for contact form
CREATE TABLE public.licensing_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  role TEXT,
  license_interest TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- Create substrate licenses table for tracking Developer License subscriptions
CREATE TABLE public.substrate_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  license_type TEXT NOT NULL DEFAULT 'developer',
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  organization TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.licensing_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_licenses ENABLE ROW LEVEL SECURITY;

-- Licensing inquiries: public insert for contact form
CREATE POLICY "Anyone can submit licensing inquiry"
  ON public.licensing_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Admins can read inquiries
CREATE POLICY "Admins can view licensing inquiries"
  ON public.licensing_inquiries
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Substrate licenses: users can view their own
CREATE POLICY "Users can view their own licenses"
  ON public.substrate_licenses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Service role can manage licenses
CREATE POLICY "Service role can manage licenses"
  ON public.substrate_licenses
  FOR ALL
  USING (true)
  WITH CHECK (true);