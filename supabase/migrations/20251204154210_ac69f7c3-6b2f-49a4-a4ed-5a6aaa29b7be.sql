-- Grant admin role to kennethsweet214@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('6abb6b94-416b-4cb0-934d-2d64df8ac109', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;