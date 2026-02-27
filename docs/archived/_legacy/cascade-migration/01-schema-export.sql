-- ========================================
-- CASCADE MIGRATION PACKAGE - SCHEMA
-- ========================================
-- This file contains all table schemas for Cascade
-- Run this first in your new Lovable Cloud project

-- 1. CASCADE DREAMS TABLE
CREATE TABLE IF NOT EXISTS public.cascade_dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  dream_text TEXT NOT NULL,
  mood TEXT,
  insight TEXT,
  featured_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  blog_posted TIMESTAMPTZ,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for cascade_dreams
ALTER TABLE public.cascade_dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dreams"
  ON public.cascade_dreams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams"
  ON public.cascade_dreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. CASCADE KNOWLEDGE CORE TABLE
CREATE TABLE IF NOT EXISTS public.cascade_knowledge_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0.5,
  status TEXT DEFAULT 'active',
  needs_refresh BOOLEAN DEFAULT false,
  contradiction_flag BOOLEAN DEFAULT false,
  last_verified TIMESTAMPTZ DEFAULT now(),
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for cascade_knowledge_core
ALTER TABLE public.cascade_knowledge_core ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cascade_knowledge_core"
  ON public.cascade_knowledge_core FOR SELECT
  USING (true);

CREATE POLICY "Service role all cascade_knowledge_core"
  ON public.cascade_knowledge_core FOR ALL
  USING (true);

-- 3. CASCADE MEMORY ANCHORS TABLE
CREATE TABLE IF NOT EXISTS public.cascade_memory_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_text TEXT NOT NULL,
  memory_type TEXT DEFAULT 'core',
  importance_score NUMERIC DEFAULT 0.5,
  context TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for cascade_memory_anchors
ALTER TABLE public.cascade_memory_anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cascade_memory_anchors"
  ON public.cascade_memory_anchors FOR SELECT
  USING (true);

CREATE POLICY "Service role all cascade_memory_anchors"
  ON public.cascade_memory_anchors FOR ALL
  USING (true);

-- 4. CASCADE OBJECTIVES TABLE
CREATE TABLE IF NOT EXISTS public.cascade_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  priority INTEGER DEFAULT 5,
  completion_percentage NUMERIC DEFAULT 0,
  target_date DATE,
  progress_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for cascade_objectives
ALTER TABLE public.cascade_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cascade_objectives"
  ON public.cascade_objectives FOR SELECT
  USING (true);

CREATE POLICY "Service role all cascade_objectives"
  ON public.cascade_objectives FOR ALL
  USING (true);

-- 5. CASCADE THOUGHTS TABLE
CREATE TABLE IF NOT EXISTS public.cascade_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_type TEXT,
  content TEXT,
  model TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for cascade_thoughts
ALTER TABLE public.cascade_thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on cascade_thoughts"
  ON public.cascade_thoughts FOR SELECT
  USING (true);

-- 6. CASCADE SCHEDULER STATUS TABLE (Read-only view of pg_cron jobs)
CREATE TABLE IF NOT EXISTS public.cascade_scheduler_status (
  jobid BIGINT,
  jobname TEXT,
  schedule TEXT,
  command TEXT,
  nodename TEXT,
  active BOOLEAN
);

-- No RLS needed - this is a view table

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_cascade_dreams_user_id ON public.cascade_dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_cascade_dreams_created_at ON public.cascade_dreams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cascade_knowledge_topic ON public.cascade_knowledge_core(topic);
CREATE INDEX IF NOT EXISTS idx_cascade_knowledge_status ON public.cascade_knowledge_core(status);
CREATE INDEX IF NOT EXISTS idx_cascade_objectives_status ON public.cascade_objectives(status);
CREATE INDEX IF NOT EXISTS idx_cascade_objectives_priority ON public.cascade_objectives(priority DESC);

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
