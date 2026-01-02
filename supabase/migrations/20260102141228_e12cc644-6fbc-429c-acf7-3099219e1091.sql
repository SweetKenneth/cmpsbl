-- Fix RLS Disabled in Public: Enable RLS on cascade_conversations and cascade_dreams

-- Enable RLS on cascade_conversations
ALTER TABLE public.cascade_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for cascade_conversations
-- Service role has full access (for edge functions)
CREATE POLICY "Service role full access cascade_conversations" 
ON public.cascade_conversations 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can view conversations (public read for chat history display)
CREATE POLICY "Public read cascade_conversations" 
ON public.cascade_conversations 
FOR SELECT 
USING (true);

-- Enable RLS on cascade_dreams  
ALTER TABLE public.cascade_dreams ENABLE ROW LEVEL SECURITY;

-- Create policies for cascade_dreams
-- Service role has full access (for edge functions that generate dreams)
CREATE POLICY "Service role full access cascade_dreams" 
ON public.cascade_dreams 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Public can read dreams (they are meant to be publicly visible content)
CREATE POLICY "Public read cascade_dreams" 
ON public.cascade_dreams 
FOR SELECT 
USING (true);