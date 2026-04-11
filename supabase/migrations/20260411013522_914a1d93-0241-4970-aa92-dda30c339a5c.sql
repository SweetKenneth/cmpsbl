
-- 1. Fix marketplace_mailing_list: remove user_id IS NULL from SELECT policy
DROP POLICY IF EXISTS "Users can view own subscription" ON public.marketplace_mailing_list;
CREATE POLICY "Users can view own subscription"
  ON public.marketplace_mailing_list
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix immunity_rules: remove anon SELECT policy, restrict to admin
DROP POLICY IF EXISTS "Anon read immunity_rules" ON public.immunity_rules;
CREATE POLICY "Admins can read immunity_rules"
  ON public.immunity_rules
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix analytics_events: remove anon bulk read policy
DROP POLICY IF EXISTS "Anon read own session analytics" ON public.analytics_events;
