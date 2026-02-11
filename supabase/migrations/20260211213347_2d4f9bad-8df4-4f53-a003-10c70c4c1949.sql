-- E-E-A-T Editorial Review Fields for AutoBlog
ALTER TABLE public.auto_blog_posts
  ADD COLUMN IF NOT EXISTS reviewed_by text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS author_name text DEFAULT 'CMPSBL Research Team',
  ADD COLUMN IF NOT EXISTS author_role text DEFAULT 'AI Systems Architecture',
  ADD COLUMN IF NOT EXISTS experience_tags text[] DEFAULT ARRAY['AI Operating Systems', 'Cognitive Infrastructure'];