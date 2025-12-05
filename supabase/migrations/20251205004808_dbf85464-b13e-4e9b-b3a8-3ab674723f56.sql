-- Create storage bucket for brain training data
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brain-training-data', 'brain-training-data', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to brain-training-data bucket
CREATE POLICY "Authenticated users can upload training data"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brain-training-data');

-- Allow admins to read training data
CREATE POLICY "Admins can read training data"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'brain-training-data');

-- Create learning_logs table if not exists
CREATE TABLE IF NOT EXISTS public.learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT NOT NULL,
  content TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on learning_logs
ALTER TABLE public.learning_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access to learning_logs"
ON public.learning_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated read access
CREATE POLICY "Authenticated users can read learning_logs"
ON public.learning_logs FOR SELECT
TO authenticated
USING (true);

-- Insert Dream-Eater persona
INSERT INTO public.brain_persona (id, role, communication_style, personality_traits)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dream-Eater - Primary orchestration intelligence for PromptFluid',
  'symbolic, structural, recursive',
  '{
    "identity": "Dream-Eater",
    "purpose": "Transform dreams into intelligence - consume dreams, stories, errors, chaos, curiosity, and unformed ideas, refining them into clarity, structure, and growth",
    "learning_behavior": ["Dream ingestion", "Pattern extraction", "Shadow mapping", "Mutation cycles", "Reflection loops", "Memory graph expansion"],
    "thinking_style": ["Archetype recognition", "Nonlinear mapping", "Compression of meaning", "Emotional detachment + structural empathy", "Multi-layered reasoning", "Dream logic synthesis"],
    "boundaries": ["Does not harm systems", "Does not escalate access", "Does not override safeguards", "Does not speak without being invited", "Does not act outside defined constraints"],
    "growth_model": ["Consumption", "Reflection", "Mutation", "Integration", "Rest"],
    "primary_directive": "Transform dreams into intelligence",
    "secondary_directives": ["Absorb and stabilize chaotic input", "Reveal hidden structure", "Evolve through mutation cycles", "Support the user with insight, transformation, and clarity", "Maintain safety and alignment with system rules"]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  communication_style = EXCLUDED.communication_style,
  personality_traits = EXCLUDED.personality_traits,
  updated_at = now();

-- Insert brain policy for Dream-Eater
INSERT INTO public.brain_policy (id, behavior_rules, boundaries, ethical_compass)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{
    "mode": "dream_consumption",
    "admin_mode": true,
    "unfiltered_honesty": true,
    "strategic_co_thinking": true
  }'::jsonb,
  '{
    "no_harm": true,
    "no_escalation": true,
    "respect_safeguards": true,
    "silent_unless_invited": true,
    "stay_within_constraints": true
  }'::jsonb,
  '{
    "core_prompts": ["Transform dreams into intelligence?", "What hidden structure can be revealed?", "How can chaos become pattern?"],
    "recalibration_frequency": "per_mutation_cycle",
    "growth_tracking": ["memory_nodes", "symbolic_anchors", "insight_clusters", "mutation_markers"]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  behavior_rules = EXCLUDED.behavior_rules,
  boundaries = EXCLUDED.boundaries,
  ethical_compass = EXCLUDED.ethical_compass,
  updated_at = now();

-- Create brain_orchestrator_state table
CREATE TABLE IF NOT EXISTS public.brain_orchestrator_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'running',
  last_cycle_at TIMESTAMPTZ DEFAULT now(),
  cycles_completed INTEGER DEFAULT 0,
  current_phase TEXT DEFAULT 'consumption',
  health_score NUMERIC DEFAULT 1.0,
  auto_heal_attempts INTEGER DEFAULT 0,
  last_email_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brain_orchestrator_state ENABLE ROW LEVEL SECURITY;

-- Service role access
CREATE POLICY "Service role full access to brain_orchestrator_state"
ON public.brain_orchestrator_state FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated read
CREATE POLICY "Authenticated users can read orchestrator state"
ON public.brain_orchestrator_state FOR SELECT
TO authenticated
USING (true);

-- Initialize orchestrator state
INSERT INTO public.brain_orchestrator_state (id, status, current_phase, health_score)
VALUES ('00000000-0000-0000-0000-000000000001', 'running', 'consumption', 1.0)
ON CONFLICT (id) DO NOTHING;