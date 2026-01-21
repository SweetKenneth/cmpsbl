-- ═══════════════════════════════════════════════════════════════════
-- AGENCY MINT SYSTEM — Database Schema
-- Tables for agencies, members, templates, and purchases
-- ═══════════════════════════════════════════════════════════════════

-- Agency templates (pre-built team configurations)
CREATE TABLE public.agency_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  base_price_cents integer DEFAULT 39500,
  default_members jsonb DEFAULT '[]'::jsonb,
  dream_pool_mode text DEFAULT 'local_shared',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agencies (purchased team configurations)
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  template_id uuid REFERENCES public.agency_templates(id),
  leader_id uuid,
  dream_pool_mode text DEFAULT 'local_shared' CHECK (dream_pool_mode IN ('local_only', 'local_shared', 'read_only_shared', 'full_mesh')),
  cohesion_rating integer DEFAULT 80 CHECK (cohesion_rating >= 0 AND cohesion_rating <= 100),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'purchased', 'deployed', 'archived')),
  deployment_type text DEFAULT 'hosted' CHECK (deployment_type IN ('standalone', 'embedded', 'hosted')),
  deployment_domain text,
  business_profile jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agency members (cognitives assigned to agencies)
CREATE TABLE public.agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  cognitive_id uuid REFERENCES public.cognitive_registry(id),
  role text NOT NULL CHECK (role IN ('leader', 'specialist')),
  specialization text NOT NULL,
  skill_weights jsonb DEFAULT '{"research": 0.5, "analysis": 0.5, "execution": 0.5}'::jsonb,
  is_leader boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Agency purchases (Stripe checkout tracking)
CREATE TABLE public.agency_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  agency_id uuid REFERENCES public.agencies(id),
  stripe_session_id text UNIQUE,
  stripe_customer_id text,
  base_price_cents integer NOT NULL DEFAULT 39500,
  additional_cognitives integer DEFAULT 0,
  additional_price_cents integer DEFAULT 0,
  total_price_cents integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  purchase_email text,
  onboarding_token text UNIQUE,
  onboarding_completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shared Dream Pool entries
CREATE TABLE public.agency_dream_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  dream_content text NOT NULL,
  dream_type text DEFAULT 'insight',
  contributor_id uuid,
  visibility text DEFAULT 'shared' CHECK (visibility IN ('private', 'shared', 'broadcast')),
  sentiment_score numeric,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agency_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_dream_pool ENABLE ROW LEVEL SECURITY;

-- Templates are publicly readable
CREATE POLICY "Templates are publicly readable" ON public.agency_templates FOR SELECT USING (true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates" ON public.agency_templates FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Agencies: owners can view/edit their own, admins can view all
CREATE POLICY "Users can view own agencies" ON public.agencies FOR SELECT 
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create agencies" ON public.agencies FOR INSERT 
WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

CREATE POLICY "Users can update own agencies" ON public.agencies FOR UPDATE 
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete agencies" ON public.agencies FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Agency members follow agency ownership
CREATE POLICY "View agency members" ON public.agency_members FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agencies WHERE id = agency_id 
  AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Manage agency members" ON public.agency_members FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.agencies WHERE id = agency_id 
  AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

-- Purchases: users can view their own
CREATE POLICY "Users can view own purchases" ON public.agency_purchases FOR SELECT 
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert purchases" ON public.agency_purchases FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update purchases" ON public.agency_purchases FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Dream pool follows agency ownership
CREATE POLICY "View dream pool" ON public.agency_dream_pool FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agencies WHERE id = agency_id 
  AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Manage dream pool" ON public.agency_dream_pool FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.agencies WHERE id = agency_id 
  AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

-- Add foreign key for leader_id after agencies table exists
ALTER TABLE public.agencies ADD CONSTRAINT agencies_leader_id_fkey 
FOREIGN KEY (leader_id) REFERENCES public.agency_members(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_purchases_updated_at BEFORE UPDATE ON public.agency_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.agency_templates (name, slug, description, icon, default_members, is_featured) VALUES
('Startup SWAT', 'startup-swat', 'Rapid deployment team for early-stage ventures. Research, coding, and ops in one unit.', 'Rocket', 
'[{"role": "leader", "specialization": "Hybrid"}, {"role": "specialist", "specialization": "Coding"}, {"role": "specialist", "specialization": "Research"}, {"role": "specialist", "specialization": "OPS"}]', true),

('Marketing & Growth Bureau', 'marketing-growth', 'Full-stack growth team. Content, analytics, and campaign optimization.', 'TrendingUp',
'[{"role": "leader", "specialization": "Hybrid"}, {"role": "specialist", "specialization": "Writing"}, {"role": "specialist", "specialization": "Marketing"}, {"role": "specialist", "specialization": "Analyst"}]', true),

('Ops & Efficiency Division', 'ops-efficiency', 'Operational excellence unit. Process optimization and automation.', 'Settings',
'[{"role": "leader", "specialization": "Hybrid"}, {"role": "specialist", "specialization": "OPS"}, {"role": "specialist", "specialization": "Analyst"}, {"role": "specialist", "specialization": "Support"}]', true),

('Product R&D Lab', 'product-rd', 'Innovation lab for product development. Research, prototyping, and testing.', 'Lightbulb',
'[{"role": "leader", "specialization": "Hybrid"}, {"role": "specialist", "specialization": "Research"}, {"role": "specialist", "specialization": "Coding"}, {"role": "specialist", "specialization": "Analyst"}]', true),

('Risk & Defense Unit', 'risk-defense', 'Security and risk management team. Threat detection and mitigation.', 'Shield',
'[{"role": "leader", "specialization": "Hybrid"}, {"role": "specialist", "specialization": "Defense"}, {"role": "specialist", "specialization": "Analyst"}, {"role": "specialist", "specialization": "Research"}]', true);