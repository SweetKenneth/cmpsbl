-- Developer Learning & Onboarding Tables

-- Skill tree nodes defining learning paths
CREATE TABLE public.developer_skill_tree (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'foundation',
  tier INTEGER NOT NULL DEFAULT 1,
  xp_required INTEGER NOT NULL DEFAULT 100,
  prerequisites TEXT[] DEFAULT '{}',
  unlocks TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT '🔷',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Developer progress tracking
CREATE TABLE public.developer_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  skill_key TEXT NOT NULL REFERENCES developer_skill_tree(skill_key),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(developer_id, skill_key)
);

-- Certification badges
CREATE TABLE public.developer_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certification_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT DEFAULT '🏆',
  badge_color TEXT DEFAULT 'gold',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  min_xp_total INTEGER DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Earned certifications
CREATE TABLE public.developer_earned_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  certification_key TEXT NOT NULL REFERENCES developer_certifications(certification_key),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_hash TEXT,
  metadata JSONB DEFAULT '{}',
  UNIQUE(developer_id, certification_key)
);

-- Tutorial progress
CREATE TABLE public.developer_tutorial_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  tutorial_id TEXT NOT NULL,
  step_index INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  code_submissions JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(developer_id, tutorial_id)
);

-- Sandbox sessions
CREATE TABLE public.developer_sandbox_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  session_name TEXT,
  code_state JSONB DEFAULT '{}',
  memory_state JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI tool usage tracking
CREATE TABLE public.developer_ai_tool_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  input_context TEXT,
  output_result TEXT,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE developer_skill_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_sandbox_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_ai_tool_usage ENABLE ROW LEVEL SECURITY;

-- Public read for skill tree and certifications
CREATE POLICY "Skill tree is public" ON developer_skill_tree FOR SELECT USING (true);
CREATE POLICY "Certifications are public" ON developer_certifications FOR SELECT USING (true);

-- Developer-specific access
CREATE POLICY "Developers can view own progress" ON developer_progress FOR SELECT USING (true);
CREATE POLICY "Developers can update own progress" ON developer_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Developers can modify own progress" ON developer_progress FOR UPDATE USING (true);

CREATE POLICY "Developers can view earned badges" ON developer_earned_badges FOR SELECT USING (true);
CREATE POLICY "Developers can earn badges" ON developer_earned_badges FOR INSERT WITH CHECK (true);

CREATE POLICY "Developers can view tutorial progress" ON developer_tutorial_progress FOR SELECT USING (true);
CREATE POLICY "Developers can update tutorial progress" ON developer_tutorial_progress FOR ALL USING (true);

CREATE POLICY "Developers can manage sandbox" ON developer_sandbox_sessions FOR ALL USING (true);

CREATE POLICY "AI usage is trackable" ON developer_ai_tool_usage FOR ALL USING (true);

-- Seed skill tree
INSERT INTO developer_skill_tree (skill_key, name, description, category, tier, xp_required, prerequisites, unlocks, icon) VALUES
('sdk_basics', 'SDK Fundamentals', 'Learn to initialize and configure the substrate SDK', 'foundation', 1, 100, '{}', ARRAY['memory_ops', 'api_keys'], '📚'),
('memory_ops', 'Memory Operations', 'Master store, recall, and forget operations', 'foundation', 1, 150, ARRAY['sdk_basics'], ARRAY['context_windows', 'importance_scoring'], '🧠'),
('api_keys', 'API Key Management', 'Generate and manage secure API keys', 'foundation', 1, 75, ARRAY['sdk_basics'], ARRAY['rate_limiting'], '🔑'),
('context_windows', 'Context Windows', 'Understand and optimize context management', 'intermediate', 2, 200, ARRAY['memory_ops'], ARRAY['semantic_search'], '🪟'),
('importance_scoring', 'Importance Scoring', 'Configure memory importance and decay', 'intermediate', 2, 175, ARRAY['memory_ops'], ARRAY['memory_tiers'], '⭐'),
('rate_limiting', 'Rate Limiting', 'Handle rate limits gracefully', 'intermediate', 2, 125, ARRAY['api_keys'], ARRAY['quota_management'], '🚦'),
('semantic_search', 'Semantic Search', 'Implement vector-based memory retrieval', 'advanced', 3, 300, ARRAY['context_windows'], ARRAY['rag_patterns'], '🔍'),
('memory_tiers', 'Memory Tiers', 'Use hot, warm, and cold storage tiers', 'advanced', 3, 250, ARRAY['importance_scoring'], ARRAY['memory_governance'], '🗄️'),
('quota_management', 'Quota Management', 'Track and optimize usage quotas', 'advanced', 3, 200, ARRAY['rate_limiting'], ARRAY['cost_optimization'], '📊'),
('rag_patterns', 'RAG Integration', 'Build retrieval-augmented generation pipelines', 'expert', 4, 400, ARRAY['semantic_search'], ARRAY['production_patterns'], '🔗'),
('memory_governance', 'Memory Governance', 'Implement compliance and data policies', 'expert', 4, 350, ARRAY['memory_tiers'], ARRAY['production_patterns'], '🛡️'),
('cost_optimization', 'Cost Optimization', 'Minimize costs while maximizing performance', 'expert', 4, 300, ARRAY['quota_management'], ARRAY['production_patterns'], '💰'),
('production_patterns', 'Production Patterns', 'Deploy production-ready agent architectures', 'mastery', 5, 500, ARRAY['rag_patterns', 'memory_governance', 'cost_optimization'], '{}', '🚀');

-- Seed certifications
INSERT INTO developer_certifications (certification_key, name, description, badge_icon, badge_color, required_skills, min_xp_total) VALUES
('substrate_fundamentals', 'Substrate Fundamentals', 'Completed core SDK training', '🎓', 'bronze', ARRAY['sdk_basics', 'memory_ops', 'api_keys'], 300),
('memory_specialist', 'Memory Specialist', 'Mastered memory operations and optimization', '🧠', 'silver', ARRAY['context_windows', 'importance_scoring', 'memory_tiers'], 600),
('integration_expert', 'Integration Expert', 'Expert in API and quota management', '⚡', 'gold', ARRAY['rate_limiting', 'quota_management', 'cost_optimization'], 500),
('substrate_architect', 'Substrate Architect', 'Full mastery of substrate patterns', '👑', 'platinum', ARRAY['production_patterns'], 2000);

-- Indexes
CREATE INDEX idx_dev_progress_developer ON developer_progress(developer_id);
CREATE INDEX idx_dev_badges_developer ON developer_earned_badges(developer_id);
CREATE INDEX idx_dev_tutorial_developer ON developer_tutorial_progress(developer_id);
CREATE INDEX idx_dev_sandbox_developer ON developer_sandbox_sessions(developer_id);
CREATE INDEX idx_dev_ai_usage_developer ON developer_ai_tool_usage(developer_id);