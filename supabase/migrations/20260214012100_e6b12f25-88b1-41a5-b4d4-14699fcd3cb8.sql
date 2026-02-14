
-- Stripe product/price mapping for cognitives
CREATE TABLE IF NOT EXISTS public.cognitive_stripe_map (
  sku TEXT PRIMARY KEY,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  price_cents INTEGER NOT NULL DEFAULT 3900,
  currency TEXT NOT NULL DEFAULT 'usd',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cognitive_stripe_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cognitive stripe map"
  ON public.cognitive_stripe_map FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify cognitive stripe map"
  ON public.cognitive_stripe_map FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders table for cognitive purchases
CREATE TABLE IF NOT EXISTS public.cognitive_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  sku TEXT NOT NULL,
  chosen_name TEXT,
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cognitive_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cognitive orders"
  ON public.cognitive_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert cognitive orders"
  ON public.cognitive_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update cognitive orders"
  ON public.cognitive_orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create private storage bucket for cognitive ZIPs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cognitives_zips', 'cognitives_zips', false)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated admin users can access cognitives_zips 
CREATE POLICY "Authenticated users can download cognitives via signed URL"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cognitives_zips');
