-- Auto Blog Schedule table
CREATE TABLE IF NOT EXISTS public.auto_blog_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto Blog Posts table (stores generated content)
CREATE TABLE IF NOT EXISTS public.auto_blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  topic_seed TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_blog_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Anyone can read published posts"
ON public.auto_blog_posts
FOR SELECT
USING (status = 'published');

-- Service role full access for automation
CREATE POLICY "Service role manages schedule"
ON public.auto_blog_schedule
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role manages posts"
ON public.auto_blog_posts
FOR ALL
USING (true)
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_auto_blog_schedule_status ON public.auto_blog_schedule(status);
CREATE INDEX idx_auto_blog_schedule_scheduled_at ON public.auto_blog_schedule(scheduled_at);
CREATE INDEX idx_auto_blog_posts_slug ON public.auto_blog_posts(slug);
CREATE INDEX idx_auto_blog_posts_status ON public.auto_blog_posts(status);
CREATE INDEX idx_auto_blog_posts_published_at ON public.auto_blog_posts(published_at);

-- Trigger to update updated_at
CREATE TRIGGER update_auto_blog_posts_updated_at
BEFORE UPDATE ON public.auto_blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();