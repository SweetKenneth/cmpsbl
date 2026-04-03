CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (action, performed_by, entity_type, entity_id, details)
  VALUES (
    TG_OP || '_user_role',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'user_roles',
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'role', COALESCE(NEW.role::text, OLD.role::text),
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;