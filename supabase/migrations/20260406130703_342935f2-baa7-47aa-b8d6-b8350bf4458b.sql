
CREATE TABLE public.memory_stream_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical TEXT NOT NULL,
  tier_label TEXT NOT NULL,
  cjpi_min INTEGER NOT NULL,
  cjpi_max INTEGER NOT NULL,
  target_weight NUMERIC(5,2) NOT NULL,
  computed_weight NUMERIC(5,2) NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vertical, tier_label)
);

ALTER TABLE public.memory_stream_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for memory stream config"
  ON public.memory_stream_config FOR SELECT
  USING (true);

COMMENT ON TABLE public.memory_stream_config IS 'Persisted dynamic rarity weights for Memory Stream pulls, recomputed each CDM cycle.';
