
-- Atomic server-side pack activation RPC
-- Prevents race conditions across multiple tabs/sessions
CREATE OR REPLACE FUNCTION public.activate_pack(p_user_id uuid, p_pack_id text, p_capacity integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_active_count INTEGER;
  v_result RECORD;
BEGIN
  -- Lock user's activations to prevent concurrent activation
  PERFORM 1 FROM user_pack_activations
    WHERE user_id = p_user_id
    FOR UPDATE;

  -- Count currently active packs
  SELECT COUNT(*) INTO v_active_count
  FROM user_pack_activations
  WHERE user_id = p_user_id AND active = true;

  -- Enforce capacity
  IF v_active_count >= p_capacity THEN
    -- Log the attempt
    INSERT INTO activation_audit_log (user_id, pack_id, event_type, slot_capacity, active_count, metadata)
    VALUES (p_user_id, p_pack_id, 'slot_limit_reached', p_capacity, v_active_count, '{"source":"rpc"}'::jsonb);

    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'SLOT_LIMIT_REACHED',
      'activeCount', v_active_count,
      'capacity', p_capacity
    );
  END IF;

  -- Upsert activation
  INSERT INTO user_pack_activations (user_id, pack_id, active, activated_at, deactivated_at)
  VALUES (p_user_id, p_pack_id, true, now(), null)
  ON CONFLICT (user_id, pack_id)
  DO UPDATE SET active = true, activated_at = now(), deactivated_at = null;

  -- Get new count
  SELECT COUNT(*) INTO v_active_count
  FROM user_pack_activations
  WHERE user_id = p_user_id AND active = true;

  -- Audit log
  INSERT INTO activation_audit_log (user_id, pack_id, event_type, slot_capacity, active_count, metadata)
  VALUES (p_user_id, p_pack_id, 'activated', p_capacity, v_active_count, '{"source":"rpc"}'::jsonb);

  RETURN jsonb_build_object(
    'ok', true,
    'reason', null,
    'activeCount', v_active_count,
    'capacity', p_capacity
  );
END;
$$;

-- Atomic server-side pack deactivation RPC
CREATE OR REPLACE FUNCTION public.deactivate_pack(p_user_id uuid, p_pack_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_active_count INTEGER;
BEGIN
  -- Deactivate
  UPDATE user_pack_activations
  SET active = false, deactivated_at = now()
  WHERE user_id = p_user_id AND pack_id = p_pack_id AND active = true;

  -- Get new count
  SELECT COUNT(*) INTO v_active_count
  FROM user_pack_activations
  WHERE user_id = p_user_id AND active = true;

  -- Audit log
  INSERT INTO activation_audit_log (user_id, pack_id, event_type, slot_capacity, active_count, metadata)
  VALUES (p_user_id, p_pack_id, 'deactivated', 0, v_active_count, '{"source":"rpc"}'::jsonb);

  RETURN jsonb_build_object(
    'ok', true,
    'activeCount', v_active_count
  );
END;
$$;
