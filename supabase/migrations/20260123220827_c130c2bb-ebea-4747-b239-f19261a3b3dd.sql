-- =============================================
-- DEVELOPER TEMPLATES - Starter Kits for Games/Devs
-- =============================================

CREATE TABLE IF NOT EXISTS public.developer_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('gaming', 'chatbot', 'agent', 'rag', 'utility', 'world_engine')),
  description TEXT NOT NULL,
  long_description TEXT,
  features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  required_modules TEXT[] NOT NULL DEFAULT ARRAY['brain']::TEXT[],
  default_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  example_code TEXT,
  documentation_url TEXT,
  thumbnail_url TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_setup_minutes INTEGER NOT NULL DEFAULT 5,
  install_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE developer_templates ENABLE ROW LEVEL SECURITY;

-- Templates are public read
CREATE POLICY "Anyone can view active templates" ON developer_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manages templates" ON developer_templates FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dev_templates_category ON developer_templates(category);
CREATE INDEX IF NOT EXISTS idx_dev_templates_featured ON developer_templates(is_featured) WHERE is_featured = true;

-- Update trigger
CREATE OR REPLACE TRIGGER update_developer_templates_timestamp BEFORE UPDATE ON developer_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Gaming Templates
INSERT INTO developer_templates (name, slug, category, description, long_description, features, required_modules, default_config, difficulty, estimated_setup_minutes, is_featured) VALUES
('NPC Brain', 'npc-brain', 'gaming', 'Persistent memory and personality for game NPCs', 
 'Give your NPCs true persistent memory that survives across game sessions. Each NPC remembers player interactions, develops relationships, and makes decisions based on accumulated experiences. Perfect for RPGs, adventure games, and any title where NPCs need to feel alive.',
 ARRAY['Persistent memory across sessions', 'Relationship tracking', 'Mood and personality states', 'Dream cycles for offline learning', 'LLM-powered dialogue'],
 ARRAY['brain', 'decode', 'dream'],
 '{"memory_retention_days": 30, "personality_enabled": true, "dream_cycles_enabled": true}'::JSONB,
 'beginner', 10, true),

('World Engine', 'world-engine', 'world_engine', 'Full cognitive layer for game worlds with hundreds of NPCs',
 'The complete cognitive substrate for game studios. Manage entire worlds of intelligent NPCs, each with their own memories, goals, and evolving personalities. Includes faction systems, world events, and coordinated NPC behavior.',
 ARRAY['Multi-NPC orchestration', 'Faction memory systems', 'World event propagation', 'NPC relationship graphs', 'Coordinated group behavior', 'Performance-optimized for scale'],
 ARRAY['brain', 'decode', 'dream', 'nexus', 'ripple', 'vision'],
 '{"max_npcs": 1000, "faction_enabled": true, "world_events_enabled": true, "dream_pool_shared": true}'::JSONB,
 'advanced', 30, true),

('NPC Dialogue', 'npc-dialogue', 'gaming', 'Natural conversations with context-aware NPCs',
 'Enable your NPCs to have natural, context-aware conversations. The Decode module interprets player intent while Brain provides conversational memory. NPCs remember what players said and respond appropriately.',
 ARRAY['Context-aware responses', 'Conversation history', 'Player intent detection', 'Emotion-aware dialogue', 'Multiple conversation styles'],
 ARRAY['brain', 'decode'],
 '{"max_conversation_turns": 50, "emotion_tracking": true}'::JSONB,
 'beginner', 5, false),

('Quest Memory', 'quest-memory', 'gaming', 'NPCs that remember quest progress and player choices',
 'Track quest states and player choices across your entire game world. NPCs react to player reputation, remember completed quests, and adapt their behavior based on the player history.',
 ARRAY['Quest state persistence', 'Player reputation tracking', 'Choice consequence memory', 'NPC reaction adaptation'],
 ARRAY['brain'],
 '{"quest_tracking": true, "reputation_enabled": true}'::JSONB,
 'intermediate', 15, false),

-- Developer Templates  
('AI Chatbot', 'ai-chatbot', 'chatbot', 'Production-ready chatbot with memory and learning',
 'Deploy a sophisticated chatbot that learns and improves over time. Built-in memory means your bot remembers users and conversations. Dream cycles analyze interactions to improve responses.',
 ARRAY['Persistent user memory', 'Conversation context', 'Learning from interactions', 'Multi-provider AI support', 'Rate limiting built-in'],
 ARRAY['brain', 'decode', 'nexus', 'access'],
 '{"memory_per_user": true, "learning_enabled": true, "rate_limit_per_minute": 60}'::JSONB,
 'beginner', 10, true),

('RAG Pipeline', 'rag-pipeline', 'rag', 'Retrieval-augmented generation with Brain memory',
 'Build knowledge-aware AI applications. The Brain module stores and retrieves relevant context, while Nexus routes to the best AI provider. Perfect for documentation bots, knowledge bases, and expert systems.',
 ARRAY['Vector-based retrieval', 'Semantic search', 'Context injection', 'Source attribution', 'Memory compression'],
 ARRAY['brain', 'nexus', 'decode'],
 '{"embedding_model": "auto", "retrieval_top_k": 5, "context_window": 4096}'::JSONB,
 'intermediate', 20, true),

('Autonomous Agent', 'autonomous-agent', 'agent', 'Self-directed AI agent with goals and memory',
 'Create AI agents that pursue goals autonomously. Agents remember their progress, learn from failures, and adapt strategies over time. Dream cycles consolidate learnings during idle periods.',
 ARRAY['Goal-directed behavior', 'Task decomposition', 'Progress memory', 'Failure learning', 'Dream-cycle optimization'],
 ARRAY['brain', 'decode', 'dream', 'nexus', 'vision'],
 '{"goal_tracking": true, "autonomous_mode": true, "dream_learning": true}'::JSONB,
 'advanced', 25, false),

('Multi-Agent System', 'multi-agent', 'agent', 'Coordinated team of specialized AI agents',
 'Deploy teams of AI agents that collaborate on complex tasks. Each agent has specialized skills and shared memory enables coordination. Perfect for research, analysis, and creative workflows.',
 ARRAY['Agent specialization', 'Shared memory pool', 'Task delegation', 'Consensus mechanisms', 'Conflict resolution'],
 ARRAY['brain', 'decode', 'nexus', 'ripple', 'vision'],
 '{"max_agents": 10, "shared_memory": true, "delegation_enabled": true}'::JSONB,
 'advanced', 30, false);