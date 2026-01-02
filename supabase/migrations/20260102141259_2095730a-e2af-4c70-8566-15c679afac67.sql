-- Fix PUBLIC_DATA_EXPOSURE: Restrict sensitive brain_* tables to authenticated users only
-- This protects proprietary AI memory, learning data, and operational patterns from public exposure

-- brain_memories: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_memories" ON public.brain_memories;
CREATE POLICY "Authenticated read brain_memories" 
ON public.brain_memories 
FOR SELECT 
TO authenticated
USING (true);

-- brain_memory_hot: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_memory_hot" ON public.brain_memory_hot;
CREATE POLICY "Authenticated read brain_memory_hot" 
ON public.brain_memory_hot 
FOR SELECT 
TO authenticated
USING (true);

-- brain_memory_cold: Restrict to authenticated users  
DROP POLICY IF EXISTS "Public read brain_memory_cold" ON public.brain_memory_cold;
CREATE POLICY "Authenticated read brain_memory_cold" 
ON public.brain_memory_cold 
FOR SELECT 
TO authenticated
USING (true);

-- brain_persona: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_persona" ON public.brain_persona;
CREATE POLICY "Authenticated read brain_persona" 
ON public.brain_persona 
FOR SELECT 
TO authenticated
USING (true);

-- brain_policy: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_policy" ON public.brain_policy;
CREATE POLICY "Authenticated read brain_policy" 
ON public.brain_policy 
FOR SELECT 
TO authenticated
USING (true);

-- brain_persona_state: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_persona_state" ON public.brain_persona_state;
CREATE POLICY "Authenticated read brain_persona_state" 
ON public.brain_persona_state 
FOR SELECT 
TO authenticated
USING (true);

-- brain_events: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_events" ON public.brain_events;
CREATE POLICY "Authenticated read brain_events" 
ON public.brain_events 
FOR SELECT 
TO authenticated
USING (true);

-- brain_actions_queue: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_actions_queue" ON public.brain_actions_queue;
CREATE POLICY "Authenticated read brain_actions_queue" 
ON public.brain_actions_queue 
FOR SELECT 
TO authenticated
USING (true);

-- brain_metrics: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_metrics" ON public.brain_metrics;
CREATE POLICY "Authenticated read brain_metrics" 
ON public.brain_metrics 
FOR SELECT 
TO authenticated
USING (true);

-- brain_reach_domains: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_reach_domains" ON public.brain_reach_domains;
CREATE POLICY "Authenticated read brain_reach_domains" 
ON public.brain_reach_domains 
FOR SELECT 
TO authenticated
USING (true);

-- brain_domain_usage: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_domain_usage" ON public.brain_domain_usage;
CREATE POLICY "Authenticated read brain_domain_usage" 
ON public.brain_domain_usage 
FOR SELECT 
TO authenticated
USING (true);

-- brain_proxy_logs: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_proxy_logs" ON public.brain_proxy_logs;
CREATE POLICY "Authenticated read brain_proxy_logs" 
ON public.brain_proxy_logs 
FOR SELECT 
TO authenticated
USING (true);

-- brain_sensory_events: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read brain_sensory_events" ON public.brain_sensory_events;
CREATE POLICY "Authenticated read brain_sensory_events" 
ON public.brain_sensory_events 
FOR SELECT 
TO authenticated
USING (true);

-- defense_rules: Restrict to authenticated users
DROP POLICY IF EXISTS "Public read defense_rules" ON public.defense_rules;
CREATE POLICY "Authenticated read defense_rules" 
ON public.defense_rules 
FOR SELECT 
TO authenticated
USING (true);