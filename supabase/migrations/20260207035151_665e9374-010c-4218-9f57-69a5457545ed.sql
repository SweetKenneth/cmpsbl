-- Helper RPCs for mobile-first short-ID workflows (prefix matching on UUIDs)

CREATE OR REPLACE FUNCTION public.resolve_upgrade_plan_id(p_ref text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_ref IS NULL OR length(trim(p_ref)) = 0 THEN
    RETURN NULL;
  END IF;

  -- 1) Exact UUID match (plan id)
  BEGIN
    SELECT id INTO v_id
    FROM public.substrate_upgrade_plans
    WHERE id = (trim(p_ref))::uuid
    LIMIT 1;

    IF v_id IS NOT NULL THEN
      RETURN v_id;
    END IF;
  EXCEPTION WHEN others THEN
    -- ignore invalid uuid casts
  END;

  -- 2) Prefix match (mobile Short ID)
  SELECT id INTO v_id
  FROM public.substrate_upgrade_plans
  WHERE id::text ILIKE (trim(p_ref)) || '%'
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN v_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.resolve_evolution_run(p_ref text)
RETURNS TABLE (run_id uuid, plan_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF p_ref IS NULL OR length(trim(p_ref)) = 0 THEN
    RETURN;
  END IF;

  -- 1) Exact UUID match on run_id or plan_id
  BEGIN
    RETURN QUERY
    SELECT er.run_id, er.plan_id
    FROM public.evolution_runs er
    WHERE er.run_id = (trim(p_ref))::uuid
       OR er.plan_id = (trim(p_ref))::uuid
    ORDER BY er.created_at DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN;
    END IF;
  EXCEPTION WHEN others THEN
    -- ignore invalid uuid casts
  END;

  -- 2) Prefix match (Short ID) on either run_id or plan_id
  RETURN QUERY
  SELECT er.run_id, er.plan_id
  FROM public.evolution_runs er
  WHERE er.run_id::text ILIKE (trim(p_ref)) || '%'
     OR er.plan_id::text ILIKE (trim(p_ref)) || '%'
  ORDER BY er.created_at DESC
  LIMIT 1;
END;
$$;