
-- Webhook subscriptions table
CREATE TABLE public.webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  event_types TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook delivery log
CREATE TABLE public.webhook_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.webhook_subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  response_status INT,
  response_body TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  latency_ms INT
);

-- Enable RLS
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_subscriptions
CREATE POLICY "Users can view own webhook subscriptions"
  ON public.webhook_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own webhook subscriptions"
  ON public.webhook_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own webhook subscriptions"
  ON public.webhook_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own webhook subscriptions"
  ON public.webhook_subscriptions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS policies for webhook_delivery_log (read via subscription ownership)
CREATE POLICY "Users can view own delivery logs"
  ON public.webhook_delivery_log FOR SELECT
  TO authenticated
  USING (
    subscription_id IN (
      SELECT id FROM public.webhook_subscriptions WHERE user_id = auth.uid()
    )
  );

-- Index for efficient querying
CREATE INDEX idx_webhook_subs_user ON public.webhook_subscriptions(user_id);
CREATE INDEX idx_webhook_subs_active ON public.webhook_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_delivery_sub ON public.webhook_delivery_log(subscription_id);
CREATE INDEX idx_webhook_delivery_time ON public.webhook_delivery_log(delivered_at);
