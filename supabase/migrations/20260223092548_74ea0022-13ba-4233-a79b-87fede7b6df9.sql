
-- Make user_id NOT NULL since RLS depends on it
ALTER TABLE public.cognitive_orders ALTER COLUMN user_id SET NOT NULL;
