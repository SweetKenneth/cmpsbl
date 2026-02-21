
INSERT INTO public.system_flags (key, enabled)
VALUES ('substrate_radio_enabled', true)
ON CONFLICT (key) DO UPDATE SET enabled = true;
