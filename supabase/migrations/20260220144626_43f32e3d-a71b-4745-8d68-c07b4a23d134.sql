-- Allow viewing tasks for deployed agencies (public portal access)
CREATE POLICY "Anyone can view tasks for deployed agencies"
  ON public.agency_tasks
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = agency_tasks.agency_id
    AND agencies.status = 'deployed'
    AND agencies.slug IS NOT NULL
  ));

-- Allow viewing members for deployed agencies
CREATE POLICY "Anyone can view members for deployed agencies"
  ON public.agency_members
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = agency_members.agency_id
    AND agencies.status = 'deployed'
    AND agencies.slug IS NOT NULL
  ));

-- Allow viewing task logs for deployed agencies
CREATE POLICY "Anyone can view logs for deployed agencies"
  ON public.agency_task_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agency_tasks
    JOIN agencies ON agencies.id = agency_tasks.agency_id
    WHERE agency_tasks.id = agency_task_logs.task_id
    AND agencies.status = 'deployed'
    AND agencies.slug IS NOT NULL
  ));