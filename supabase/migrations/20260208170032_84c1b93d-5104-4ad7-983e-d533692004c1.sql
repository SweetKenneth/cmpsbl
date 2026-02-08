-- Create the missing increment_dream_rate_limit function
CREATE OR REPLACE FUNCTION public.increment_dream_rate_limit(p_session_hash text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO dream_rate_limits (session_hash, submission_count, last_submission_at)
  VALUES (p_session_hash, 1, now())
  ON CONFLICT (session_hash) DO UPDATE SET
    submission_count = CASE 
      WHEN dream_rate_limits.last_submission_at < now() - INTERVAL '1 hour' 
      THEN 1 
      ELSE dream_rate_limits.submission_count + 1 
    END,
    last_submission_at = now();
END;
$function$;