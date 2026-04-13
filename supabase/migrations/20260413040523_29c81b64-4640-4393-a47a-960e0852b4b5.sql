
-- Add previous_hash column for cryptographic chain
ALTER TABLE public.lex_registry_events
  ADD COLUMN IF NOT EXISTS previous_hash TEXT DEFAULT '';

-- Update INSERT audit trigger to chain hashes
CREATE OR REPLACE FUNCTION public.lex_registry_audit_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  prev_hash TEXT;
BEGIN
  -- Get the most recent event hash for this registry entry (or empty for first)
  SELECT hash_anchor INTO prev_hash
  FROM public.lex_registry_events
  ORDER BY created_at DESC
  LIMIT 1;

  IF prev_hash IS NULL THEN
    prev_hash := '';
  END IF;

  INSERT INTO public.lex_registry_events (
    registry_id, event_type, new_status, actor_id, hash_anchor, previous_hash, metadata
  ) VALUES (
    NEW.id,
    'registered',
    NEW.status,
    NEW.registrant_user_id,
    encode(sha256(convert_to(
      prev_hash || NEW.package_hash || NEW.package_name || NEW.status::text || now()::text,
      'UTF8'
    )), 'hex'),
    prev_hash,
    jsonb_build_object('package_name', NEW.package_name, 'registrant_org', NEW.registrant_org)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update status-change audit trigger to chain hashes
CREATE OR REPLACE FUNCTION public.lex_registry_audit_on_update()
RETURNS TRIGGER AS $$
DECLARE
  prev_hash TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get the most recent event hash
    SELECT hash_anchor INTO prev_hash
    FROM public.lex_registry_events
    WHERE registry_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    IF prev_hash IS NULL THEN
      prev_hash := '';
    END IF;

    INSERT INTO public.lex_registry_events (
      registry_id, event_type, previous_status, new_status, actor_id, hash_anchor, previous_hash, metadata
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      NEW.registrant_user_id,
      encode(sha256(convert_to(
        prev_hash || NEW.package_hash || OLD.status::text || NEW.status::text || now()::text,
        'UTF8'
      )), 'hex'),
      prev_hash,
      jsonb_build_object('previous_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
