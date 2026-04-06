
CREATE POLICY "Allow insert on memory stream config"
  ON public.memory_stream_config FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on memory stream config"
  ON public.memory_stream_config FOR UPDATE
  USING (true)
  WITH CHECK (true);
