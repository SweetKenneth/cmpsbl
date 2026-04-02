-- Workbench items table for cross-device persistence
CREATE TABLE public.workbench_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

ALTER TABLE public.workbench_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workbench items"
  ON public.workbench_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own workbench"
  ON public.workbench_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own workbench"
  ON public.workbench_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);