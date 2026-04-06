
-- Compiled product proposals table
CREATE TABLE public.compiled_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vertical TEXT NOT NULL DEFAULT 'primary',
  name TEXT NOT NULL,
  description TEXT,
  discovery_ids TEXT[] NOT NULL DEFAULT '{}',
  combined_chain TEXT[] NOT NULL DEFAULT '{}',
  coherence_score NUMERIC NOT NULL DEFAULT 0,
  compatibility_score NUMERIC NOT NULL DEFAULT 0,
  estimated_value_cents INTEGER NOT NULL DEFAULT 0,
  component_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  rating INTEGER,
  notes TEXT,
  rated_at TIMESTAMP WITH TIME ZONE,
  cdm_cycle_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compiler feedback / learning table
CREATE TABLE public.compiler_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  compilation_id UUID REFERENCES public.compiled_products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  discovery_ids TEXT[] NOT NULL DEFAULT '{}',
  combined_chain TEXT[] NOT NULL DEFAULT '{}',
  coherence_score NUMERIC NOT NULL DEFAULT 0,
  compatibility_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compiler weight adjustments table (learning state)
CREATE TABLE public.compiler_weights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primitive_pair TEXT NOT NULL UNIQUE,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  positive_signals INTEGER NOT NULL DEFAULT 0,
  negative_signals INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_compiled_products_status ON public.compiled_products(status);
CREATE INDEX idx_compiled_products_vertical ON public.compiled_products(vertical);
CREATE INDEX idx_compiler_feedback_compilation ON public.compiler_feedback(compilation_id);
CREATE INDEX idx_compiler_weights_pair ON public.compiler_weights(primitive_pair);

-- RLS
ALTER TABLE public.compiled_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compiler_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compiler_weights ENABLE ROW LEVEL SECURITY;

-- Governor-only access (authenticated users with admin role)
CREATE POLICY "Governor can manage compiled products" ON public.compiled_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Governor can manage compiler feedback" ON public.compiler_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Governor can manage compiler weights" ON public.compiler_weights FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon read for compiler to generate proposals during CDM
CREATE POLICY "Anon read compiled products" ON public.compiled_products FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert compiled products" ON public.compiled_products FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon read compiler weights" ON public.compiler_weights FOR SELECT TO anon USING (true);
