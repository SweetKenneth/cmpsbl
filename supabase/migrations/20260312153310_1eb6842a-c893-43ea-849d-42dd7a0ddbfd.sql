-- Indexes for mesh_comms (high-traffic, currently only has created_at index)
CREATE INDEX IF NOT EXISTS idx_mesh_comms_source_module ON public.mesh_comms (source_module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mesh_comms_category ON public.mesh_comms (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mesh_comms_resolver ON public.mesh_comms (resolver_id) WHERE resolver_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mesh_comms_source_target ON public.mesh_comms (source_module, target_module);

-- Partial index for analytics_events session lookups
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events (session_id, created_at DESC) WHERE session_id IS NOT NULL;

-- Partial index for brain_memory_hot active dedup queries
CREATE INDEX IF NOT EXISTS idx_brain_memory_hot_created ON public.brain_memory_hot (created_at DESC);