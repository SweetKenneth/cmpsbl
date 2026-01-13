-- Create edge_rate_limits table for unified rate limiting
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  function_name TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_lookup 
ON public.edge_rate_limits (identifier, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_function 
ON public.edge_rate_limits (function_name, window_start DESC);

-- Enable RLS
ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role can manage rate limits
CREATE POLICY "Service role full access to rate limits" 
ON public.edge_rate_limits 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create security_audit_log table for security event tracking
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  client_ip TEXT,
  user_agent TEXT,
  details JSONB,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for security log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_function 
ON public.security_audit_log (function_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_type 
ON public.security_audit_log (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_ip 
ON public.security_audit_log (client_ip, created_at DESC);

-- Enable RLS
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role can manage security logs
CREATE POLICY "Service role full access to security logs" 
ON public.security_audit_log 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Function to clean up old rate limit records (run daily)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete rate limit records older than 1 day
  DELETE FROM public.edge_rate_limits
  WHERE window_start < now() - INTERVAL '1 day';
  
  -- Delete security logs older than 30 days
  DELETE FROM public.security_audit_log
  WHERE created_at < now() - INTERVAL '30 days';
END;
$$;