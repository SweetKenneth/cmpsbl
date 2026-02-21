
CREATE POLICY "Service can delete stale radio broadcasts"
ON public.radio_broadcasts FOR DELETE
USING (true);

CREATE POLICY "Service can insert radio broadcasts"
ON public.radio_broadcasts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update radio broadcasts"
ON public.radio_broadcasts FOR UPDATE
USING (true);
