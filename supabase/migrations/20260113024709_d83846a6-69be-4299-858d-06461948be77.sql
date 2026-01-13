-- ============================================
-- SECURITY HARDENING MIGRATION - Part 2
-- Fix remaining policies with proper DROP IF EXISTS
-- ============================================

-- 5. FIX: Profiles table - Restrict public access to protect PII
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. FIX: Brain system tables - Drop existing and recreate
-- brain_memories
DROP POLICY IF EXISTS "Public read brain_memories" ON public.brain_memories;
DROP POLICY IF EXISTS "Anyone can read brain_memories" ON public.brain_memories;
DROP POLICY IF EXISTS "Authenticated read brain_memories" ON public.brain_memories;
CREATE POLICY "Authenticated read brain_memories"
ON public.brain_memories FOR SELECT
TO authenticated
USING (true);

-- brain_reflections
DROP POLICY IF EXISTS "Public read brain_reflections" ON public.brain_reflections;
DROP POLICY IF EXISTS "Anyone can read brain_reflections" ON public.brain_reflections;
DROP POLICY IF EXISTS "Authenticated read brain_reflections" ON public.brain_reflections;
CREATE POLICY "Authenticated read brain_reflections"
ON public.brain_reflections FOR SELECT
TO authenticated
USING (true);

-- brain_events
DROP POLICY IF EXISTS "Public read brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Anyone can read brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Authenticated read brain_events" ON public.brain_events;
CREATE POLICY "Authenticated read brain_events"
ON public.brain_events FOR SELECT
TO authenticated
USING (true);

-- learning_cycles
DROP POLICY IF EXISTS "Public read learning_cycles" ON public.learning_cycles;
DROP POLICY IF EXISTS "Anyone can read learning_cycles" ON public.learning_cycles;
DROP POLICY IF EXISTS "Authenticated read learning_cycles" ON public.learning_cycles;
CREATE POLICY "Authenticated read learning_cycles"
ON public.learning_cycles FOR SELECT
TO authenticated
USING (true);

-- brain_memory_hot
DROP POLICY IF EXISTS "Public read brain_memory_hot" ON public.brain_memory_hot;
DROP POLICY IF EXISTS "Anyone can read brain_memory_hot" ON public.brain_memory_hot;
DROP POLICY IF EXISTS "Authenticated read brain_memory_hot" ON public.brain_memory_hot;
CREATE POLICY "Authenticated read brain_memory_hot"
ON public.brain_memory_hot FOR SELECT
TO authenticated
USING (true);

-- brain_memory_cold
DROP POLICY IF EXISTS "Public read brain_memory_cold" ON public.brain_memory_cold;
DROP POLICY IF EXISTS "Anyone can read brain_memory_cold" ON public.brain_memory_cold;
DROP POLICY IF EXISTS "Authenticated read brain_memory_cold" ON public.brain_memory_cold;
CREATE POLICY "Authenticated read brain_memory_cold"
ON public.brain_memory_cold FOR SELECT
TO authenticated
USING (true);

-- brain_forecasts
DROP POLICY IF EXISTS "Public read brain_forecasts" ON public.brain_forecasts;
DROP POLICY IF EXISTS "Anyone can read brain_forecasts" ON public.brain_forecasts;
DROP POLICY IF EXISTS "Authenticated read brain_forecasts" ON public.brain_forecasts;
CREATE POLICY "Authenticated read brain_forecasts"
ON public.brain_forecasts FOR SELECT
TO authenticated
USING (true);

-- brain_curiosity_log
DROP POLICY IF EXISTS "Public read brain_curiosity_log" ON public.brain_curiosity_log;
DROP POLICY IF EXISTS "Anyone can read brain_curiosity_log" ON public.brain_curiosity_log;
DROP POLICY IF EXISTS "Authenticated read brain_curiosity_log" ON public.brain_curiosity_log;
CREATE POLICY "Authenticated read brain_curiosity_log"
ON public.brain_curiosity_log FOR SELECT
TO authenticated
USING (true);

-- brain_cross_insights
DROP POLICY IF EXISTS "Public read brain_cross_insights" ON public.brain_cross_insights;
DROP POLICY IF EXISTS "Anyone can read brain_cross_insights" ON public.brain_cross_insights;
DROP POLICY IF EXISTS "Authenticated read brain_cross_insights" ON public.brain_cross_insights;
CREATE POLICY "Authenticated read brain_cross_insights"
ON public.brain_cross_insights FOR SELECT
TO authenticated
USING (true);

-- learning_patterns
DROP POLICY IF EXISTS "Public read learning_patterns" ON public.learning_patterns;
DROP POLICY IF EXISTS "Anyone can read learning_patterns" ON public.learning_patterns;
DROP POLICY IF EXISTS "Authenticated read learning_patterns" ON public.learning_patterns;
CREATE POLICY "Authenticated read learning_patterns"
ON public.learning_patterns FOR SELECT
TO authenticated
USING (true);

-- learning_results
DROP POLICY IF EXISTS "Public read learning_results" ON public.learning_results;
DROP POLICY IF EXISTS "Anyone can read learning_results" ON public.learning_results;
DROP POLICY IF EXISTS "Authenticated read learning_results" ON public.learning_results;
CREATE POLICY "Authenticated read learning_results"
ON public.learning_results FOR SELECT
TO authenticated
USING (true);